import dash
from dash import dcc, html, Input, Output, dash_table
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
from sqlalchemy import create_engine
from db_config import DATABASE_URL

PRIMARY = "#2E86AB"
SUCCESS = "#28A745"
WARNING = "#FFC107"
DANGER = "#DC3545"
INFO = "#17A2B8"
BG = "#f8f9fa"

app = dash.Dash(__name__, external_stylesheets=['https://codepen.io/chriddyp/pen/bWLwgP.css'])
engine = create_engine(DATABASE_URL)

# 1. Shipments with latest location from scan_logs
def fetch_shipments():
    query = """
        SELECT s.id, s.status, s.item_type, s.quantity_kg, s.origin_id, s.destination_id, s.timestamp AS created_at,
               f.name AS item_name, f.id AS item_id,
               sl.checkpoint_lat AS latitude, sl.checkpoint_lon AS longitude, sl.scanned_at
        FROM shipments s
        LEFT JOIN food_aid_items f ON s.aid_item_id = f.id
        LEFT JOIN (
            SELECT shipment_id, checkpoint_lat, checkpoint_lon, scanned_at
            FROM scan_logs
            WHERE scanned_at IS NOT NULL
            AND (shipment_id, scanned_at) IN (
                SELECT shipment_id, MAX(scanned_at)
                FROM scan_logs
                GROUP BY shipment_id
            )
        ) sl ON s.id = sl.shipment_id
    """
    df = pd.read_sql(query, engine)
    return df

# 2. Feedbacks
def fetch_feedbacks():
    query = "SELECT * FROM feedbacks"
    df = pd.read_sql(query, engine)
    return df

# 3. Issues
def fetch_issues():
    query = "SELECT * FROM issues"
    df = pd.read_sql(query, engine)
    return df

# 4. Fraud detection results
def fetch_fraud():
    query = "SELECT shipment_id, score, is_fraud, reason, detected_at FROM fraud_detections"
    df = pd.read_sql(query, engine)
    return df

# 5. Audit trail
def fetch_audit_trail():
    query = "SELECT * FROM audit_trails ORDER BY timestamp DESC LIMIT 10"
    df = pd.read_sql(query, engine)
    return df

def calculate_kpis(shipments, feedbacks, issues):
    total_dispatched = len(shipments)
    total_delivered = len(shipments[shipments['status'] == 'Delivered'])
    delayed_shipments = len(shipments[shipments['status'] == 'Delayed'])
    lost_shipments = len(shipments[shipments['status'] == 'Lost'])
    avg_transit_time = None
    if 'scanned_at' in shipments and 'created_at' in shipments:
        valid = shipments.dropna(subset=['scanned_at', 'created_at'])
        if not valid.empty:
            valid['transit_time'] = (pd.to_datetime(valid['scanned_at']) - pd.to_datetime(valid['created_at'])).dt.total_seconds() / 3600
            avg_transit_time = valid['transit_time'].mean()
    issues_reported = len(issues)
    return {
        'total_dispatched': total_dispatched,
        'total_delivered': total_delivered,
        'delivery_rate': (total_delivered / total_dispatched * 100) if total_dispatched > 0 else 0,
        'delayed_shipments': delayed_shipments,
        'avg_transit_time': avg_transit_time if avg_transit_time else 0,
        'issues_reported': issues_reported,
        'lost_shipments': lost_shipments
    }

app.layout = html.Div([
    html.Div([
        html.H1("Food Aid Transparency Dashboard", style={
            'textAlign': 'center', 'color': PRIMARY, 'marginBottom': 10, 'fontWeight': 'bold', 'fontSize': '2.5em'
        }),
        html.P("End-to-end tracking, audit trail, and citizen feedback for malnourished children food aid.",
               style={'textAlign': 'center', 'color': '#666', 'fontSize': 18}),
        html.Div([
            
            html.Br(),
            html.Span("Hackathon Challenge: Digital Tracking Solution for Health Service Transparency", style={'color': DANGER, 'fontWeight': 'bold'})
        ], style={'textAlign': 'center', 'marginBottom': '10px'})
    ], style={'backgroundColor': BG, 'padding': '20px', 'marginBottom': '20px', 'borderRadius': '12px', 'boxShadow': '0 2px 8px #e0e0e0'}),
    dcc.Interval(id='interval-component', interval=30*1000, n_intervals=0),
    html.Div(id='kpi-cards', style={'marginBottom': '30px'}),
    html.Div([
        html.Div([
            html.H3("Live Tracking Map", style={'color': PRIMARY}),
            dcc.Graph(id='tracking-map', style={'marginBottom': '20px'}),
            html.H3("Recent Shipments", style={'color': PRIMARY, 'marginTop': '30px'}),
            html.Div(id='shipment-table')
        ], className='six columns', style={'backgroundColor': 'white', 'borderRadius': '12px', 'padding': '15px', 'boxShadow': '0 2px 8px #e0e0e0'}),
        html.Div([
            html.H3("Supply Chain Analytics", style={'color': PRIMARY}),
            dcc.Graph(id='trend-charts'),
            html.H3("Alerts & Anomalies", style={'color': PRIMARY, 'marginTop': '30px'}),
            html.Div(id='alerts-panel'),
            html.H3("Feedback Overview", style={'color': PRIMARY, 'marginTop': '30px'}),
            dcc.Graph(id='feedback-chart'),
            html.H3("Audit Trail", style={'color': PRIMARY, 'marginTop': '30px'}),
            html.Div(id='audit-table')
        ], className='six columns', style={'backgroundColor': 'white', 'borderRadius': '12px', 'padding': '15px', 'boxShadow': '0 2px 8px #e0e0e0'})
    ], className='row')
], style={'padding': '20px', 'backgroundColor': BG})

@app.callback(Output('kpi-cards', 'children'), [Input('interval-component', 'n_intervals')])
def update_kpi_cards(n):
    shipments = fetch_shipments()
    feedbacks = fetch_feedbacks()
    issues = fetch_issues()
    kpis = calculate_kpis(shipments, feedbacks, issues)
    card_style = {
        'backgroundColor': 'white', 'padding': '20px', 'textAlign': 'center',
        'boxShadow': '0 4px 8px rgba(0,0,0,0.08)', 'borderRadius': '12px', 'margin': '5px'
    }
    return html.Div([
        html.Div([
            html.H4("🚚", style={'fontSize': '2em'}),
            html.H4(f"{kpis['total_dispatched']}", style={'color': PRIMARY, 'fontSize': '2.2em', 'margin': '0'}),
            html.P("Total Shipment", style={'color': '#666', 'fontSize': '1.1em'})
        ], className='two columns', style=card_style),
        html.Div([
            html.H4("✅", style={'fontSize': '2em'}),
            html.H4(f"{kpis['delivery_rate']:.1f}%", style={'color': SUCCESS, 'fontSize': '2.2em', 'margin': '0'}),
            html.P("Delivery Rate", style={'color': '#666', 'fontSize': '1.1em'})
        ], className='two columns', style=card_style),
        html.Div([
            html.H4("⏱️", style={'fontSize': '2em'}),
            html.H4(f"{kpis['avg_transit_time']:.1f}h", style={'color': WARNING, 'fontSize': '2.2em', 'margin': '0'}),
            html.P("Avg Transit Time", style={'color': '#666', 'fontSize': '1.1em'})
        ], className='two columns', style=card_style),
        html.Div([
            html.H4("⚠️", style={'fontSize': '2em'}),
            html.H4(f"{kpis['delayed_shipments']}", style={'color': DANGER, 'fontSize': '2.2em', 'margin': '0'}),
            html.P("Delayed Shipments", style={'color': '#666', 'fontSize': '1.1em'})
        ], className='two columns', style=card_style),
        html.Div([
            html.H4("❌", style={'fontSize': '2em'}),
            html.H4(f"{kpis['lost_shipments']}", style={'color': DANGER, 'fontSize': '2.2em', 'margin': '0'}),
            html.P("Lost Shipments", style={'color': '#666', 'fontSize': '1.1em'})
        ], className='two columns', style=card_style),
        html.Div([
            html.H4("📝", style={'fontSize': '2em'}),
            html.H4(f"{kpis['issues_reported']}", style={'color': INFO, 'fontSize': '2.2em', 'margin': '0'}),
            html.P("Issues Reported", style={'color': '#666', 'fontSize': '1.1em'})
        ], className='two columns', style=card_style)
    ], className='row')

@app.callback(Output('tracking-map', 'figure'), [Input('interval-component', 'n_intervals')])
def update_map(n):
    shipments = fetch_shipments()
    color_map = {
        'Delivered': SUCCESS,
        'In Transit': PRIMARY,
        'Delayed': DANGER,
        'Lost': '#6c757d'
    }
    shipments['color'] = shipments['status'].map(color_map)
    fig = px.scatter_mapbox(
        shipments.dropna(subset=['latitude', 'longitude']),
        lat='latitude', lon='longitude',
        color='status',
        hover_name='id',
        hover_data={'item_name': True, 'status': True, 'quantity_kg': True},
        color_discrete_map=color_map,
        zoom=7,
        height=400
    )
    fig.update_layout(
        mapbox_style="open-street-map",
        mapbox=dict(center=dict(lat=-1.9441, lon=29.8739)),
        showlegend=True,
        margin={"r":0,"t":0,"l":0,"b":0}
    )
    return fig

@app.callback(Output('shipment-table', 'children'), [Input('interval-component', 'n_intervals')])
def update_shipment_table(n):
    shipments = fetch_shipments()
    df_recent = shipments.sort_values('created_at', ascending=False).head(10)
    df_recent['created_at'] = pd.to_datetime(df_recent['created_at']).dt.strftime('%Y-%m-%d %H:%M')
    return dash_table.DataTable(
        data=df_recent[['id', 'status', 'item_name', 'quantity_kg', 'created_at']].to_dict('records'),
        columns=[
            {'name': 'Shipment ID', 'id': 'id'},
            {'name': 'Status', 'id': 'status'},
            {'name': 'Item', 'id': 'item_name'},
            {'name': 'Quantity (kg)', 'id': 'quantity_kg'},
            {'name': 'Created', 'id': 'created_at'}
        ],
        style_cell={'textAlign': 'left', 'padding': '10px', 'fontSize': '1em'},
        style_header={'backgroundColor': PRIMARY, 'color': 'white', 'fontWeight': 'bold'},
        style_data_conditional=[
            {'if': {'filter_query': '{status} = Delayed'}, 'backgroundColor': '#f8d7da', 'color': 'black'},
            {'if': {'filter_query': '{status} = Delivered'}, 'backgroundColor': '#d4edda', 'color': 'black'},
            {'if': {'filter_query': '{status} = Lost'}, 'backgroundColor': '#f5c6cb', 'color': 'black'}
        ],
        style_table={'borderRadius': '8px', 'overflow': 'hidden'}
    )

@app.callback(Output('trend-charts', 'figure'), [Input('interval-component', 'n_intervals')])
def update_trend_charts(n):
    shipments = fetch_shipments()
    fig = make_subplots(
        rows=2, cols=1,
        subplot_titles=('Daily Shipments Trend', 'Delay Patterns by Item'),
        specs=[[{"secondary_y": False}], [{"secondary_y": False}]]
    )
    shipments['date'] = pd.to_datetime(shipments['created_at']).dt.date
    daily_shipments = shipments.groupby('date').size().reset_index(name='count')
    fig.add_trace(
        go.Scatter(
            x=daily_shipments['date'],
            y=daily_shipments['count'],
            mode='lines+markers',
            name='Daily Shipments',
            line=dict(color=PRIMARY)
        ),
        row=1, col=1
    )
    delayed_by_item = shipments[shipments['status'] == 'Delayed'].groupby('item_name').size()
    fig.add_trace(
        go.Bar(
            x=delayed_by_item.index,
            y=delayed_by_item.values,
            name='Delayed Shipments',
            marker_color=DANGER
        ),
        row=2, col=1
    )
    fig.update_layout(height=500, showlegend=False, plot_bgcolor=BG)
    return fig

@app.callback(Output('alerts-panel', 'children'), [Input('interval-component', 'n_intervals')])
def update_alerts_panel(n):
    shipments = fetch_shipments()
    frauds = fetch_fraud()
    alerts = []
    suspicious = frauds[frauds['is_fraud'] == 1]
    if not suspicious.empty:
        alerts.append({
            'type': 'danger',
            'message': f"{len(suspicious)} shipments flagged as fraud: " +
                       ", ".join(suspicious['reason'].dropna().unique()),
            'icon': '🚨'
        })
    delayed_shipments = shipments[shipments['status'] == 'Delayed']
    if len(delayed_shipments) > 0:
        alerts.append({
            'type': 'warning',
            'message': f"{len(delayed_shipments)} shipments are currently delayed.",
            'icon': '⚠️'
        })
    lost_shipments = shipments[shipments['status'] == 'Lost']
    if len(lost_shipments) > 0:
        alerts.append({
            'type': 'danger',
            'message': f"{len(lost_shipments)} shipments reported lost.",
            'icon': '❌'
        })
    if not alerts:
        alerts.append({
            'type': 'success',
            'message': "All systems operating normally.",
            'icon': '✅'
        })
    color_map = {'warning': WARNING, 'danger': DANGER, 'success': SUCCESS}
    return html.Div([
        html.Div([
            html.Span(alert['icon'], style={'fontSize': '1.5em', 'marginRight': '10px'}),
            html.Span(alert['message'])
        ], style={
            'backgroundColor': color_map[alert['type']],
            'color': 'white',
            'padding': '15px',
            'marginBottom': '10px',
            'borderRadius': '8px',
            'boxShadow': '0 2px 8px #e0e0e0'
        }) for alert in alerts
    ])

@app.callback(Output('feedback-chart', 'figure'), [Input('interval-component', 'n_intervals')])
def update_feedback_chart(n):
    feedbacks = fetch_feedbacks()
    feedback_counts = feedbacks['feedback_type'].value_counts() if 'feedback_type' in feedbacks else pd.Series()
    fig = px.pie(
        values=feedback_counts.values,
        names=feedback_counts.index,
        title="Feedback Distribution",
        color_discrete_sequence=[PRIMARY, SUCCESS, WARNING, DANGER, INFO]
    )
    fig.update_layout(height=300, legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5))
    return fig

@app.callback(Output('audit-table', 'children'), [Input('interval-component', 'n_intervals')])
def update_audit_table(n):
    audits = fetch_audit_trail()
    if audits.empty:
        return html.Div("No recent audit trail records.", style={'color': DANGER, 'padding': '20px'})
    audits['timestamp'] = pd.to_datetime(audits['timestamp']).dt.strftime('%Y-%m-%d %H:%M')
    return dash_table.DataTable(
        data=audits[['user_id', 'action', 'table_name', 'record_id', 'timestamp']].to_dict('records'),
        columns=[
            {'name': 'User ID', 'id': 'user_id'},
            {'name': 'Action', 'id': 'action'},
            {'name': 'Table', 'id': 'table_name'},
            {'name': 'Record', 'id': 'record_id'},
            {'name': 'Timestamp', 'id': 'timestamp'}
        ],
        style_cell={'textAlign': 'left', 'padding': '8px', 'fontSize': '1em'},
        style_header={'backgroundColor': PRIMARY, 'color': 'white', 'fontWeight': 'bold'},
        style_table={'borderRadius': '8px', 'overflow': 'hidden'}
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8050)
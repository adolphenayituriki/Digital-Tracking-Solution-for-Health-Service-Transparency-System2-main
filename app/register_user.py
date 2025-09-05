import requests

url = "http://localhost:8000/auth/register"
data = {
    "username": "CYPRIEN",
    "password": "Cyprien@100",
    "role": "official"
}
r = requests.post(url, json=data)
print(r.json())
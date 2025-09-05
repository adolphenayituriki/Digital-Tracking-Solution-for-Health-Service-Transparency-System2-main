import React from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../api";

export default function DistributorScanner() {
  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render(
      (decodedText) => {
        api.post("/shipments/scan", { tracking_id: decodedText }).then(() => {
          alert("Scan recorded: " + decodedText);
        });
      },
      (err) => {}
    );
    return () => scanner.clear().catch(console.error);
  }, []);

  return <div id="reader" style={{ width: "500px", margin: "auto" }}></div>;
}

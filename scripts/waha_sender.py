#!/usr/bin/env python3
"""
WAHA (WhatsApp HTTP API - GOWS Engine) Production Utility Script
Hosted on Render free tier (pinged every 5 min by UptimeRobot).

100% Dynamic Script:
- Takes Doctor Name, Target Number, Endpoints, API Keys, and Appointment List dynamically.
- Configurable via CLI arguments or environment variables.
- No hardcoded doctor names or patient data.
"""

import os
import sys
import re
import json
import argparse
import requests

# Fix Unicode stdout encoding for Windows console compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Default WAHA Configuration (Configurable via environment variables)
DEFAULT_WAHA_ENDPOINT = os.getenv("WAHA_ENDPOINT", "https://your-waha-app.onrender.com/api/sendText")
DEFAULT_API_KEY = os.getenv("WAHA_API_KEY", "KhanAman@9807")
DEFAULT_SESSION = os.getenv("WAHA_SESSION", "default")

def format_waha_chat_id(phone_number: str) -> str:
    """
    Formats a raw phone number for WAHA:
    1. Removes '+', spaces, hyphens, and non-digit characters.
    2. If missing country code for 10-digit Indian numbers, prepends '91'.
    3. Appends '@c.us' at the end.
    
    Example: '+91 8418878491' -> '918418878491@c.us'
    """
    if not phone_number:
        raise ValueError("Phone number cannot be empty")
        
    # Strip all non-digit characters
    digits = re.sub(r'\D', '', str(phone_number))
    
    # Prepend country code 91 if only 10 digits provided
    if len(digits) == 10:
        digits = f"91{digits}"
        
    return f"{digits}@c.us"

def send_whatsapp_message(
    text: str,
    target_number: str,
    endpoint: str = DEFAULT_WAHA_ENDPOINT,
    api_key: str = DEFAULT_API_KEY,
    session: str = DEFAULT_SESSION
) -> dict:
    """
    Sends a WhatsApp text message via WAHA API (GOWS engine on Render).
    
    Returns parsed JSON response on success.
    Raises exceptions on HTTP error or connection failure.
    """
    formatted_chat_id = format_waha_chat_id(target_number)
    
    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json"
    }
    
    payload = {
        "chatId": formatted_chat_id,
        "text": text,
        "session": session
    }
    
    print(f"[WAHA Sender] Dispatching WhatsApp message to: {formatted_chat_id}")
    print(f"[WAHA Sender] Endpoint: {endpoint}")
    print(f"[WAHA Sender] Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=15)
        # Raise HTTPError for 4xx or 5xx responses
        response.raise_for_status()
        
        # Parse JSON response
        try:
            result_json = response.json()
        except ValueError:
            result_json = {"status": "ok", "raw_response": response.text}
            
        print("[SUCCESS] Message dispatched successfully via WAHA GOWS Engine:")
        print(json.dumps(result_json, indent=2))
        return result_json

    except requests.exceptions.HTTPError as http_err:
        print(f"[HTTP Error] Status [{response.status_code}]: {http_err}")
        if response.text:
            print(f"[Response Body]: {response.text}")
        raise
    except requests.exceptions.ConnectionError as conn_err:
        print(f"[Connection Notice] Could not connect to WAHA server on Render ({endpoint}).")
        print(f"[Tip] Ensure UptimeRobot is pinging the Render service every 5 min to prevent free-tier sleep.")
        raise
    except requests.exceptions.Timeout as timeout_err:
        print(f"[Timeout Error] WAHA request timed out after 15 seconds.")
        raise
    except requests.exceptions.RequestException as req_err:
        print(f"[Request Error] {req_err}")
        raise


def build_doctor_morning_digest(doctor_name: str, appointments: list) -> str:
    """
    Dynamically constructs a doctor's morning appointment briefing message.
    """
    message_text = (
        f"🌅 GOOD MORNING {doctor_name.upper()}!\n"
        f"📅 Daily Patient Appointment Schedule\n"
        f"-----------------------------------------\n\n"
    )
    
    if not appointments or len(appointments) == 0:
        message_text += "📋 Today's Schedule: No appointments currently scheduled for today.\n"
        message_text += "✨ Wish you a pleasant day ahead!\n"
    else:
        message_text += f"📋 Today's Total Appointments: {len(appointments)}\n\n"
        for idx, appt in enumerate(appointments, 1):
            time_label = appt.get("time", "Scheduled Slot")
            patient_name = appt.get("patient_name", "Patient")
            age = appt.get("age", "")
            gender = appt.get("gender", "")
            gender_age = f" ({gender}/{age})" if age else ""
            treatment = appt.get("treatment", "Dental Consultation")
            contact = appt.get("phone", "N/A")
            token = appt.get("token", f"#{idx}")
            status = appt.get("status", "Confirmed")
            
            message_text += (
                f"{idx}. {time_label} - Patient: {patient_name}{gender_age}\n"
                f"   Treatment: {treatment}\n"
                f"   Contact: {contact}\n"
                f"   Token: {token} | Status: {status}\n\n"
            )
            
    message_text += (
        "-----------------------------------------\n"
        "Dental Clinic WhatsApp Notification System | WAHA GOWS Engine"
    )
    return message_text


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WAHA WhatsApp Dispatcher Script")
    parser.add_argument("--phone", type=str, help="Target mobile number (e.g. +91 8418878491)")
    parser.add_argument("--text", type=str, help="Message body text to send")
    parser.add_argument("--doctor", type=str, help="Doctor name for morning digest")
    parser.add_argument("--endpoint", type=str, default=DEFAULT_WAHA_ENDPOINT, help="WAHA Endpoint URL")
    parser.add_argument("--key", type=str, default=DEFAULT_API_KEY, help="WAHA X-Api-Key")
    parser.add_argument("--appointments-json", type=str, help="JSON string of appointments list")
    
    args = parser.parse_args()
    
    target_phone = args.phone or os.getenv("TARGET_PHONE", "+91 8418878491")
    
    if args.doctor:
        appts = json.loads(args.appointments_json) if args.appointments_json else []
        msg = build_doctor_morning_digest(args.doctor, appts)
    elif args.text:
        msg = args.text
    else:
        # Generic dynamic test message
        msg = (
            "Hello from Dental Clinic WAHA Engine!\n"
            "Your WhatsApp API integration is active and running on Render."
        )
        
    try:
        send_whatsapp_message(
            text=msg,
            target_number=target_phone,
            endpoint=args.endpoint,
            api_key=args.key
        )
    except Exception as e:
        print(f"\n[Notice] Script execution result: {e}")

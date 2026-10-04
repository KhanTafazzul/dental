import re
import logging
from datetime import date
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

_supabase_instance = None

def get_supabase():
    """
    Safely retrieves or initializes the Supabase client instance.
    Prevents server boot crash if SUPABASE_URL or SUPABASE_KEY are missing.
    """
    global _supabase_instance
    if _supabase_instance is not None:
        return _supabase_instance

    url = (SUPABASE_URL or "").strip()
    key = (SUPABASE_KEY or "").strip()

    if not url or not key:
        logger.warning("[Supabase Notice] SUPABASE_URL or SUPABASE_KEY environment variables are missing.")
        return None

    try:
        _supabase_instance = create_client(url, key)
        return _supabase_instance
    except Exception as err:
        logger.error(f"[Supabase Init Exception]: {err}")
        return None

def clean_phone_number(phone: str) -> str:
    """Extracts last 10 digits of phone number for matching."""
    digits = re.sub(r'\D', '', str(phone or ''))
    if len(digits) >= 10:
        return digits[-10:]
    return digits

def get_patients_by_phone(phone: str) -> list:
    """
    100% Dynamic: Queries Supabase patients table by phone number.
    Returns all registered patient profiles (family members) matching the number.
    """
    last10 = clean_phone_number(phone)
    if not last10:
        return []

    client = get_supabase()
    if not client:
        return []

    try:
        # Match mobile containing last 10 digits
        res = client.from_("patients").select("*").ilike("mobile", f"%{last10}%").execute()
        return res.data or []
    except Exception as err:
        logger.error(f"Error fetching patients by phone {phone}: {err}")
        return []

def get_branches() -> list:
    """
    100% Dynamic: Queries all clinic branches from Supabase.
    """
    client = get_supabase()
    if not client:
        return []

    try:
        res = client.from_("branches").select("id, name, slug, working_hours").order("name").execute()
        return res.data or []
    except Exception as err:
        logger.error(f"Error fetching branches: {err}")
        return []

def get_doctors_by_branch(branch_id: str) -> list:
    """
    100% Dynamic: Queries all active doctors for a specific clinic branch from Supabase.
    """
    client = get_supabase()
    if not client:
        return []

    try:
        res = client.from_("doctors").select("id, name, specialty, branch_id").eq("branch_id", branch_id).order("name").execute()
        return res.data or []
    except Exception as err:
        logger.error(f"Error fetching doctors for branch {branch_id}: {err}")
        return []

def get_available_time_slots(doctor_id: str, date_str: str) -> list:
    """
    100% Dynamic: Calculates available time slots for a doctor on a specific date.
    Fetches already booked appointments from Supabase and subtracts them from clinic operating slots.
    """
    all_slots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
        "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
        "07:00 PM", "07:30 PM", "08:00 PM"
    ]

    client = get_supabase()
    if not client:
        return all_slots

    try:
        res = client.from_("appointments") \
            .select("appointment_time, status") \
            .eq("doctor_id", doctor_id) \
            .eq("appointment_date", date_str) \
            .neq("status", "cancelled") \
            .execute()
        
        booked_times = []
        if res.data:
            for item in res.data:
                raw_time = item.get("appointment_time")
                if raw_time:
                    booked_times.append(str(raw_time).strip())

        available = []
        for slot in all_slots:
            is_booked = False
            for bt in booked_times:
                if slot in bt or bt in slot or (len(bt) >= 5 and bt[:5] in slot):
                    is_booked = True
                    break
            if not is_booked:
                available.append(slot)

        return available
    except Exception as err:
        logger.error(f"Error calculating time slots for doctor {doctor_id} on {date_str}: {err}")
        return all_slots

def create_appointment(
    patient_id: str,
    doctor_id: str,
    branch_id: str,
    appointment_date: str,
    appointment_time: str,
    problem_description: str = "Booked via WhatsApp Chatbot"
) -> dict:
    """
    100% Dynamic: Inserts new appointment record into Supabase appointments table.
    """
    client = get_supabase()
    if not client:
        return {"success": False, "error": "Database client not initialized. Check SUPABASE_URL environment variable."}

    try:
        payload = {
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "branch_id": branch_id,
            "appointment_date": appointment_date,
            "appointment_time": appointment_time,
            "problem_description": problem_description,
            "status": "pending"
        }

        res = client.from_("appointments").insert(payload).select().execute()
        if res.data and len(res.data) > 0:
            return {"success": True, "data": res.data[0]}
        return {"success": False, "error": "Failed to insert appointment into database"}
    except Exception as err:
        logger.error(f"Error creating appointment: {err}")
        return {"success": False, "error": str(err)}

def get_today_appointments() -> list:
    """
    100% Dynamic: Fetches today's appointments for automated morning WhatsApp reminders.
    """
    client = get_supabase()
    if not client:
        return []

    today_str = date.today().isoformat()
    try:
        res = client.from_("appointments") \
            .select("id, appointment_date, appointment_time, status, patient_id, doctor_id, branch_id, patients(name, mobile, email), doctors(name), branches(name, address)") \
            .eq("appointment_date", today_str) \
            .in_("status", ["pending", "confirmed"]) \
            .execute()
        return res.data or []
    except Exception as err:
        logger.error(f"Error fetching today appointments for reminders: {err}")
        return []

def get_patient_upcoming_appointments(phone: str) -> list:
    """
    100% Dynamic: Fetches upcoming appointments for a phone number (@myappointments).
    """
    client = get_supabase()
    if not client:
        return []

    last10 = clean_phone_number(phone)
    if not last10:
        return []
    
    today_str = date.today().isoformat()
    try:
        patients = get_patients_by_phone(phone)
        if not patients:
            return []
            
        patient_ids = [p["id"] for p in patients]
        res = client.from_("appointments") \
            .select("id, appointment_date, appointment_time, status, doctors(name), branches(name), patients(name)") \
            .in_("patient_id", patient_ids) \
            .gte("appointment_date", today_str) \
            .order("appointment_date") \
            .execute()
            
        return res.data or []
    except Exception as err:
        logger.error(f"Error fetching patient upcoming appointments: {err}")
        return []

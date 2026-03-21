import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiX, FiTrash } from "react-icons/fi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { BeatLoader } from "react-spinners";
import "./modalcss/RecoveryEmailModal.css"

export default function PhoneNumberModal({ close }) {

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [existingPhone, setExistingPhone] = useState(null);
  const [editing, setEditing] = useState(false);

  const [phone, setPhone] = useState("");

  const [success, setSuccess] = useState("");



  // FETCH PHONE NUMBER
  useEffect(() => {

    const fetchPhone = async () => {

      try {

        const res = await api.get("/api/settings/phone-number/check");

        if (res.data?.phone_number) {

          setExistingPhone(res.data.phone_number);
          setPhone(res.data.phone_number);
          setEditing(false);

        } else {

          setEditing(true);

        }

      } catch (err) {

        console.error(err);

      }

      setLoading(false);

    };

    fetchPhone();

  }, []);




  // SAVE PHONE NUMBER
  const savePhone = async () => {

    if (!phone) return;

    setSaving(true);

    try {

      await api.put("/api/settings/phone-number", {
        phoneNumber: phone
      });

      setSuccess("Phone number updated successfully");

      setTimeout(() => {
        close();
      }, 1500);

    } catch (err) {

      console.error(err);

    }

    setSaving(false);

  };



  const removePhone = () => {

    setExistingPhone(null);
    setPhone("");
    setEditing(true);

  };



  if (loading) return null;



  return (

    <div className="modal-overlay">

      <div className="modal">
<div className="settings-options">



        {/* CLOSE BUTTON */}
        <div style={{ display: "flex", justifyContent: "space-between" ,alignItems:"center"}}>
        <h3>Phone Number</h3>
          <FiX style={{ cursor: "pointer" }} onClick={close} />
        </div>




        {/* EXISTING PHONE DISPLAY */}
        {!editing && existingPhone && (

          <div
          className="settings-item-options"
          >

            <PhoneInput
              value={existingPhone}
              disabled={true}
              country={"in"}
              inputStyle={{
                width: "260px",
                background: "transparent",
                border: "none"
              }}
              buttonStyle={{
                border: "none"
              }}
            />

            <FiTrash
              style={{ cursor: "pointer" }}
              onClick={removePhone}
            />

          </div>

        )}



        {/* PHONE INPUT */}
        {editing && (

          <div>

            <PhoneInput
              country={"in"}
              value={phone}
              onChange={setPhone}
              inputStyle={{ width: "100%" }}
            />

            <button
              style={{ marginTop: "15px", width: "100%" }}
              onClick={savePhone}
              disabled={saving}
              className="form-button"
            >

              {saving ? (
                <BeatLoader size={10} color="#ffffff" />
              ) : (
                "Save Phone Number"
              )}

            </button>

          </div>

        )}



        {/* SUCCESS MESSAGE */}
        {success && (
          <p style={{ color: "green", marginTop: "10px" }}>
            {success}
          </p>
        )}
</div>

      </div>

    </div>

  );

}
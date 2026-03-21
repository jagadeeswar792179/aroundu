import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiX, FiTrash } from "react-icons/fi";
import OtpInput from "../utils/OtpInput";
import "./modalcss/RecoveryEmailModal.css"
import { BeatLoader } from "react-spinners";
import {
  universityOptions,
  universityEmailDomains
} from "../register/universities";
export default function RecoveryEmailModal({ close }) {

  const [loading, setLoading] = useState(true);
  const [existingEmail, setExistingEmail] = useState(null);
  const [resendTimer, setResendTimer] = useState(60); // 60 seconds countdown
  const [loader, setLoader] = useState(false);
const [emailError, setEmailError] = useState("");
  const [editing, setEditing] = useState(false); 
   const [Otpload, setOtpload] = useState(false);
  
  const [email, setEmail] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);
  // CHECK recovery email on modal open
  useEffect(() => {

    const fetchRecoveryEmail = async () => {

      try {

        const res = await api.get("/api/settings/recovery-email/check");

        if (res.data?.recovery_email) {

          setExistingEmail(res.data.recovery_email);
          setEditing(false);

        } else {

          setEditing(true);

        }

      } catch (err) {

        console.error(err);

      }

      setLoading(false);

    };

    fetchRecoveryEmail();

  }, []);

const validateEmail = () => {

  if (!email) {
    setEmailError("Email is required");
    return false;
  }

  if (!email.includes("@")) {
    setEmailError("Email must contain @");
    return false;
  }

  if (!email.endsWith(".edu")) {
    setEmailError("Email must end with .edu");
    return false;
  }

  const beforeAt = email.split("@")[0];

  if (beforeAt.length > 25) {
    setEmailError("Email name must be less than 25 characters");
    return false;
  }

  setEmailError("");
  return true;
};
const isEmailValid = () => {
  if (!email) return false;
  if (!email.includes("@")) return false;
  if (!email.endsWith(".edu")) return false;

  const beforeAt = email.split("@")[0];
  if (beforeAt.length > 25) return false;

  return true;
};
  // SEND OTP
  const sendOtp = async () => {
      if (!validateEmail()) return;  
setLoader(true);
  if (!email) return;

    try {

      await api.post("/api/AuthOtp/send-otp", { email });

      setOtpSent(true);
setResendTimer(60);
    } catch (err) {

      console.error(err);

    }finally{
setLoader(false);

    }

  };


  // VERIFY OTP
  const verifyOtp = async (code) => {

    try {

      const res = await api.post("/api/AuthOtp/verify-otp", {
        email,
        otp: code
      });

      if (res.data.verified) {
        setVerified(true);
      }

    } catch (err) {

      console.error(err);

    }
    finally {
      setOtpload(false);
    }

  };


  // SAVE RECOVERY EMAIL
  const submitEmail = async () => {

    try {

      await api.put("/api/settings/recovery-email", {
        recoveryEmail: email
      });

      close();

    } catch (err) {

      console.error(err);

    }

  };


  const removeRecovery = () => {

    setExistingEmail(null);
    setEmail("");
    setEditing(true);
    setOtpSent(false);
    setVerified(false);

  };


  if (loading) return null;


  return (

    <div className="modal-overlay">

      <div className="modal">
<div className="settings-options">

        <div style={{ display: "flex", justifyContent: "space-between" ,alignItems:"center"}}>
        <h3>Recovery Email</h3>

          <FiX style={{ cursor: "pointer" }} onClick={close} />
        </div>



        {/* EXISTING EMAIL */}
        {!editing && existingEmail && (

          <div
            className="settings-item-options"
          >

            <p>{existingEmail}</p>

            <FiTrash
              style={{ cursor: "pointer" }}
              onClick={removeRecovery}
            />

          </div>

        )}


        {/* EMAIL INPUT */}
        {editing && (

          <div className="settings-item-option-2">

<input
  type="email"
  placeholder="Enter recovery email"
  value={email}
  className="input-register"
  onChange={(e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) setEmailError("");
  }}
/>

{emailError && (
  <p style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
    {emailError}
  </p>
)}
     
    {!otpSent && (

             <button
  onClick={sendOtp}
  className="form-button"
  disabled={!isEmailValid()}
  style={{
    backgroundColor: isEmailValid() ? "" : "#b5b5b5",
    cursor: isEmailValid() ? "pointer" : "not-allowed"
  }}
>
  {loader ? <BeatLoader size={10} color="#FFFFFF" /> : "Verify"}
</button>

            )}
        

          </div>
          

        )}


        {/* OTP INPUT */}
        {otpSent && (<>
          <OtpInput
            length={6}
            value={otp}
            onChange={setOtp}
            verified={verified}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

  {!verified && (
    <>
      <button
        className="form-button"
        onClick={() => verifyOtp(otp)}
        disabled={otp.length < 6 || Otpload}
      >
        {Otpload ? <BeatLoader size={10} color="white" /> : "Verify OTP"}
      </button>

      <button
        className="form-button"
        onClick={sendOtp}
        disabled={resendTimer > 0}
      >
        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
      </button>
    </>
  )}

  {verified && (
    <button
      className="form-button"
      onClick={submitEmail}
    >
      Submit Email
    </button>
  )}

</div>
        </>


        )}
</div>


       
      </div>

    </div>

  );

}
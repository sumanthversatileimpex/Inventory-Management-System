export const sendApprovalEmail = async (username, phone, email) => {
    console.log("hiiihelooos")
    try {
      await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone, email }),
      });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  };
  
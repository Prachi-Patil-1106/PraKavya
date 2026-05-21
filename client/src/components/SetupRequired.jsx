export default function SetupRequired() {
  return (
    <div className="login-screen">
      <div className="login-card" style={{ maxWidth: 460 }}>
        <div className="login-om">ॐ</div>
        <h1 className="login-title">प्राकाव्य</h1>
        <div className="login-divider"><span>॥</span></div>

        <p className="login-tagline">Firebase Setup Required</p>
        <p className="login-tagline-en" style={{ marginBottom: 24 }}>
          Add these environment variables in Vercel to activate the app
        </p>

        <div className="setup-steps">
          <div className="setup-step">
            <span className="step-num">१</span>
            <div>
              <strong>Firebase Console</strong> → New project → <em>PraKavya</em>
            </div>
          </div>
          <div className="setup-step">
            <span className="step-num">२</span>
            <div>
              <strong>Authentication</strong> → Sign-in method → Google → Enable
            </div>
          </div>
          <div className="setup-step">
            <span className="step-num">३</span>
            <div>
              <strong>Firestore Database</strong> → Create database → Test mode
            </div>
          </div>
          <div className="setup-step">
            <span className="step-num">४</span>
            <div>
              <strong>Project Settings</strong> → Add web app → copy config
            </div>
          </div>
          <div className="setup-step">
            <span className="step-num">५</span>
            <div>
              <strong>Vercel</strong> → Settings → Environment Variables → paste all <code>VITE_FIREBASE_*</code> keys → Redeploy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

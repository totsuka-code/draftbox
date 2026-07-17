export function HeaderAuth({
  t,
  lang,
  setLang,
  user,
  signOut,
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  handleAuth,
  showReset,
  setShowReset,
  resetEmail,
  setResetEmail,
  sendReset,
}) {
  return (
    <header className="header">
      <div>
        <div className="brand">{t("brand")}</div>
        <div className="kicker">{t("tagline")}</div>
      </div>
      <div>
        <div className="toolbar" style={{ justifyContent: "flex-end", marginBottom: 6 }}>
          <label className="kicker" htmlFor="lang" style={{ marginRight: 4 }}>{t("language")}</label>
          <select id="lang" className="input" value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t("language")}>
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>

        {user ? (
          <div className="toolbar" style={{ justifyContent: "flex-end" }}>
            <span className="kicker">{user.email}</span>
            <button className="button" onClick={signOut}>{t("logout")}</button>
          </div>
        ) : (
          <>
            <form onSubmit={handleAuth} className="toolbar" style={{ justifyContent: "flex-end" }}>
              <div className="formTabs">
                <button
                  type="button"
                  className="button"
                  aria-pressed={authMode === "signin"}
                  onClick={() => setAuthMode("signin")}
                >
                  {t("signin")}
                </button>
                <button
                  type="button"
                  className="button"
                  aria-pressed={authMode === "signup"}
                  onClick={() => setAuthMode("signup")}
                >
                  {t("signup")}
                </button>
              </div>
              <input className="input" type="email" required placeholder={t("email")}
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input" type="password" required placeholder={t("password")}
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="button primary" type="submit">
                {authMode === "signin" ? t("login") : t("register")}
              </button>
              <button type="button" className="button ghost" onClick={() => setShowReset((value) => !value)}>
                {t("forgot")}
              </button>
            </form>

            {showReset && (
              <form onSubmit={sendReset} className="toolbar" style={{ justifyContent: "flex-end", marginTop: 6 }}>
                <input className="input" type="email" required placeholder={t("email")}
                  value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                <button className="button" type="submit">{t("send")}</button>
              </form>
            )}
          </>
        )}
      </div>
    </header>
  );
}

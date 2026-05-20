export default function Welcome({ onNew, count }) {
  return (
    <div className="welcome">
      <div className="welcome-inner">
        <div className="welcome-om">ॐ</div>
        <h1 className="welcome-title">प्राकाव्य</h1>

        <div className="welcome-divider">
          <span className="welcome-divider-sym">॥</span>
        </div>

        <p className="welcome-marathi">तुमच्या कविता, तुमचे शब्द, तुमची दुनिया</p>
        <p className="welcome-english">Your poems · Your words · Your world</p>

        {count > 0 ? (
          <p className="welcome-count">॥ {count} कविता जतन केल्या आहेत ॥</p>
        ) : (
          <button className="btn-welcome" onClick={onNew}>
            + पहिली कविता लिहा
          </button>
        )}
      </div>
    </div>
  );
}

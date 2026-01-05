'use client'

import { useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function StartupSwipe() {
  const { data: session } = useSession()
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    scriptLoaded.current = true

    // Load the modified script that uses API
    const script = document.createElement('script')
    script.src = '/api-integrated-script.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Expose NextAuth functions to window for script.js to use
  useEffect(() => {
    (window as any).nextAuthSignIn = () => {
      signIn('google').catch(console.error)
    }
    (window as any).nextAuthSignOut = () => {
      signOut().catch(console.error)
    }
    (window as any).nextAuthSession = session
  }, [session])

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="leftside">
            <button className="brand" type="button" data-route="home" aria-label="StartupSwipe Home">
              <span className="brand-dot"></span>
              <span className="brand-name">StartupSwipe</span>
            </button>

            <nav className="navlinks" aria-label="Site navigation">
              <button className="navlink active" data-route="home" type="button">Home</button>
              <button className="navlink" data-route="about" type="button">About</button>
              <button className="navlink" data-route="explore" type="button">Explore</button>
            </nav>
          </div>

          <div className="rightside">
            <button className="btn-top primary" id="beSeedBtn" type="button">Be a Seed</button>

            <div className="user-menu" id="userMenu">
              <button className="user-trigger" id="userTrigger" type="button" aria-label="User menu">
                <span className="avatar" id="avatarLetter">?</span>
              </button>

              <div className="user-dropdown" id="userDropdown" aria-label="User dashboard">
                <div className="user-info">
                  <div className="user-name" id="username">Guest</div>
                  <div className="user-sub" id="userSub">Sign in to submit</div>
                </div>

                <button className="menu-item" data-route="profile" type="button">Profile</button>
                <button className="menu-item" data-route="profile" type="button">My Startups</button>

                <div className="menu-divider"></div>

                <button className="menu-item danger" id="logoutBtn" type="button">Log out</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="app">
        <div className="viewport">
          <div className="viewstack" id="viewstack">
            <section className="view is-active" data-view="home" aria-label="Home">
              <div className="layout">
                <article className="card" id="card" aria-label="Startup card">
                  <button className="skip" id="skipBtn" type="button">Skip</button>

                  <section className="media">
                    <div className="pill" id="pillTag">Consumer</div>

                    <div className="video-wrap" id="videoWrap">
                      <iframe
                        id="video"
                        src=""
                        title="Startup demo"
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        frameBorder="0"
                      ></iframe>
                      <div className="drag-overlay" id="dragOverlay" aria-hidden="true"></div>
                    </div>

                    <div className="video-caption">
                      <span className="caption-dot"></span>
                      <span className="caption-text" id="videoCaption">Short demo caption…</span>
                    </div>
                  </section>

                  <section className="content">
                    <div className="header">
                      <div className="left">
                        <h1 id="name">Startup Name</h1>

                        <div className="subrow">
                          <span className="tag" id="tag">Consumer</span>
                          <button className="readmore" id="readMoreBtn" type="button">Read more</button>
                        </div>

                        <p className="desc" id="desc">Short one-line description.</p>
                      </div>

                      <div className="confidence">
                        <div className="ring">
                          <svg viewBox="0 0 44 44" className="ring-svg" aria-hidden="true">
                            <circle className="ring-bg" cx="22" cy="22" r="18"></circle>
                            <circle className="ring-fg" cx="22" cy="22" r="18"></circle>
                          </svg>
                          <div className="ring-center">
                            <span className="pct" id="confidence">66</span><span className="pct-sign">%</span>
                          </div>
                        </div>
                        <small>Confidence</small>
                      </div>
                    </div>

                    <p className="question">Will they get funded?</p>

                    <div className="votes">
                      <button className="vote yes" data-vote="yes" type="button">Yes</button>
                      <button className="vote maybe" data-vote="maybe" type="button">Maybe</button>
                      <button className="vote no" data-vote="no" type="button">No</button>
                    </div>

                    <button className="feedback-btn" id="feedbackBtn" type="button">Give Feedback</button>
                  </section>
                </article>

                <aside className="trending" aria-label="Trending startups">
                  <div className="trend-head">
                    <div>
                      <div className="trend-title">Trending</div>
                      <div className="trend-sub">Live by confidence</div>
                    </div>
                    <div className="pulse" title="Live"></div>
                  </div>

                  <div className="trend-list" id="trendList"></div>

                  <div className="trend-foot">
                    <span className="trend-hint">▲ up &nbsp; ▼ down &nbsp; ▬ flat</span>
                  </div>
                </aside>
              </div>
            </section>

            <section className="view" data-view="about" aria-label="About">
              <div className="page">
                <div className="page-card">
                  <div className="page-head">
                    <h2>About</h2>
                    <p className="page-sub">A clean playground for founders and builders.</p>
                  </div>

                  <div className="page-body">
                    <p>
                      <strong>StartupSwipe</strong> is a minimalist community game where people watch startup demos,
                      vote on funding potential, and leave feedback to help founders iterate faster.
                    </p>
                    <p>
                      It's not a forum, not a feed, and not a loud timeline. It's a focused arena for judgment,
                      learning, and iteration.
                    </p>

                    <div className="contact-box">
                      <div className="contact-label">Contact</div>
                      <div className="contact-email">seed@startupswipe.example</div>
                      <div className="contact-hint">Replace with your real email when you launch.</div>
                    </div>
                  </div>

                  <div className="page-actions">
                    <button className="btn-top ghost" data-route="home" type="button">Back to Home</button>
                    <button className="btn-top primary" data-route="explore" type="button">Explore</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="view" data-view="explore" aria-label="Explore">
              <div className="page">
                <div className="page-card">
                  <div className="page-head">
                    <h2>Explore</h2>
                    <p className="page-sub">Discover categories, patterns, and what's trending.</p>
                  </div>

                  <div className="page-body">
                    <div className="chips">
                      <span className="chip">AI</span>
                      <span className="chip">DevTools</span>
                      <span className="chip">Consumer</span>
                      <span className="chip">FinTech</span>
                      <span className="chip">Health</span>
                      <span className="chip">B2B</span>
                    </div>

                    <div className="explore-grid">
                      <div className="mini-card">
                        <div className="mini-title">How it works</div>
                        <div className="mini-text">Watch a demo, vote, and leave feedback. Your votes influence trending.</div>
                      </div>
                      <div className="mini-card">
                        <div className="mini-title">What to look for</div>
                        <div className="mini-text">Clarity, speed, proof, market angle, and whether the demo is real.</div>
                      </div>
                      <div className="mini-card">
                        <div className="mini-title">Founder mode</div>
                        <div className="mini-text">Click "Be a Seed" to submit your demo video and links.</div>
                      </div>
                    </div>
                  </div>

                  <div className="page-actions">
                    <button className="btn-top ghost" data-route="about" type="button">About</button>
                    <button className="btn-top primary" data-route="home" type="button">Go to Home</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="view" data-view="profile" aria-label="Profile">
              <div className="page">
                <div className="page-card">
                  <div className="page-head">
                    <h2>Profile</h2>
                    <p className="page-sub">Your seeds, your stats.</p>
                  </div>

                  <div className="profile-header">
                    <div className="profile-avatar" id="profileAvatar">?</div>
                    <div>
                      <div className="profile-name" id="profileName">Guest</div>
                      <div className="profile-meta" id="profileMeta">Sign in to track submissions</div>
                    </div>
                  </div>

                  <div className="profile-stats">
                    <div className="stat">
                      <div className="stat-num" id="statCount">0</div>
                      <div className="stat-label">Submissions</div>
                    </div>
                    <div className="stat">
                      <div className="stat-num" id="statAvg">--</div>
                      <div className="stat-label">Avg confidence</div>
                    </div>
                    <div className="stat">
                      <div className="stat-num" id="statLatest">--</div>
                      <div className="stat-label">Latest</div>
                    </div>
                  </div>

                  <div className="profile-list" id="profileList"></div>

                  <div className="page-actions">
                    <button className="btn-top ghost" data-route="home" type="button">Back</button>
                    <button className="btn-top primary" id="profileSeedBtn" type="button">Be a Seed</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="modal-overlay" id="infoModal" hidden>
        <div className="modal" role="dialog" aria-modal="true" aria-label="Startup info">
          <div className="modal-head">
            <h2 id="infoTitle">About</h2>
            <button className="xbtn" id="closeInfo" type="button" aria-label="Close">✕</button>
          </div>
          <p className="modal-text" id="infoText">Longer description…</p>
          <div className="links">
            <a className="link" id="siteLink" href="#" target="_blank" rel="noreferrer">Website</a>
            <a className="link" id="socialLink" href="#" target="_blank" rel="noreferrer">Social</a>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="feedbackModal" hidden>
        <div className="modal" role="dialog" aria-modal="true" aria-label="Feedback">
          <div className="modal-head">
            <h2>Feedback</h2>
            <button className="xbtn" id="closeFeedback" type="button" aria-label="Close">✕</button>
          </div>

          <textarea placeholder="What's strong?"></textarea>
          <textarea placeholder="What's missing?"></textarea>
          <textarea placeholder="Similar ideas?"></textarea>

          <div className="modal-actions">
            <button className="cancel" id="cancelFeedback" type="button">Cancel</button>
            <button className="submit" type="button">Submit</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="uploadModal" hidden>
        <div className="modal" role="dialog" aria-modal="true" aria-label="Upload startup">
          <div className="modal-head">
            <h2>Upload your startup</h2>
            <button className="xbtn" id="closeUpload" type="button" aria-label="Close">✕</button>
          </div>

          <p className="modal-text subtle">Submit your startup to the feed.</p>

          <label className="field">
            <span>Startup name</span>
            <input id="upName" type="text" placeholder="Your startup name" />
          </label>

          <label className="field">
            <span>Short description</span>
            <input id="upDesc" type="text" placeholder="One line. Keep it tight." />
          </label>

          <label className="field">
            <span>YouTube video ID</span>
            <input id="upYt" type="text" placeholder="e.g., M7lc1UVf-VE" />
          </label>

          <label className="field">
            <span>Website</span>
            <input id="upSite" type="url" placeholder="https://..." />
          </label>

          <label className="field">
            <span>Social</span>
            <input id="upSocial" type="url" placeholder="https://..." />
          </label>

          <div className="modal-actions">
            <button className="cancel" id="cancelUpload" type="button">Cancel</button>
            <button className="submit" id="submitUpload" type="button">Save</button>
          </div>
        </div>
      </div>
    </>
  )
}


import React from "react";
import "./welcome.css";
import { useNavigate } from "react-router-dom";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { useEffect } from "react";
import { TbMoneybag } from "react-icons/tb";
import { FiShoppingBag } from "react-icons/fi";
import { IoMdBook } from "react-icons/io";
import { GoPackage } from "react-icons/go";
import { IoSearchOutline } from "react-icons/io5";
export default function AroundUHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("activeWPage");
        }
      });
    });

    elements.forEach((el) => observer.observe(el));
  }, []);
  return (
    <>
      <nav>
        <a href="#" className="nav-logo">
          <img src="/logo.png" alt="no img" />
          <div className="nav-logo-text">
            <span>Around</span>
            <span>U</span>
          </div>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#for-you">For You</a>
          </li>
          <li>
            <a href="#stories">Stories</a>
          </li>
          <li>
            <a href="#signup">Get Started</a>
          </li>
        </ul>
        <div className="nav-ctas">
          <button className="btn-nav-out" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="btn-nav-fill" onClick={() => navigate("/login")}>
            Join Free
          </button>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-orb-1"></div>
        <div className="hero-orb-2"></div>
        <div className="hero-orb-3"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <div className=""></div>
              Built exclusively for verified students &amp; faculty
            </div>
            {/* <div className="eyebrow-dot"></div>
              Built exclusively for verified students &amp; faculty
            </div> */}
            <h1>
              <span className="h1-navy">Keeping</span>
              <br />
              <span className="h1-under">Campuses</span>
              <br />
              <span className="h1-teal">Connected</span>
              <span className="h1-navy"> with </span>
              <span className="h1-green">AroundU</span>
            </h1>
            <p>
              The all-in-one campus platform — social feed, marketplace, lost
              &amp; found, professor bookings, and a way to earn money, all in
              one verified community.
            </p>
            <div className="hero-btns">
              <button className="btn-hero-a" onClick={() => navigate("/login")}>
                Join as Student
              </button>
              <button className="btn-hero-b" onClick={() => navigate("/login")}>
                Join as Professor
              </button>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <div className="trust-icon ti-teal">✓</div>
                University email verified
              </div>
              <div className="trust-item">
                <div className="trust-icon ti-green">✓</div>
                Free to join
              </div>
              <div className="trust-item">
                <div className="trust-icon ti-blue">✓</div>
                No fake accounts
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="phone-wrap">
              <div className="fbadge fb1">
                <span className="fb-ic">💬</span>
                <div>
                  <div className="fb-t1">New message!</div>
                  <div className="fb-t2" style={{ color: "var(--teal)" }}>
                    From Prof. Johnson
                  </div>
                </div>
              </div>
              <div className="fbadge fb2">
                <span className="fb-ic">💰</span>
                <div>
                  <div className="fb-t1">Session booked!</div>
                  <div className="fb-t2" style={{ color: "var(--green)" }}>
                    +$25 earned 🎉
                  </div>
                </div>
              </div>
              <div className="fbadge fb3">
                <span className="fb-ic">📦</span>
                <div>
                  <div className="fb-t1">Lost &amp; Found</div>
                  <div className="fb-t2" style={{ color: "var(--gray)" }}>
                    AirPods recovered!
                  </div>
                </div>
              </div>
              <div className="fbadge fb4">
                <span className="fb-ic">🎓</span>
                <div>
                  <div className="fb-t1">3 nearby students</div>
                  <div className="fb-t2" style={{ color: "var(--navy)" }}>
                    Same major as you!
                  </div>
                </div>
              </div>

              <div className="phone">
                <div className="phone-notch"></div>
                <div className="p-screen">
                  <div className="p-topbar">
                    <div className="p-logo-txt">
                      <span>Around</span>
                      <span>U</span>
                    </div>
                    <div className="p-icons">
                      <div className="p-icon">🔔</div>
                      <div className="p-icon">✉️</div>
                    </div>
                  </div>
                  <div className="p-pills">
                    <span className="p-pill act">All</span>
                    <span className="p-pill">Interests</span>
                    <span className="p-pill">My Uni</span>
                    <span className="p-pill">Course</span>
                  </div>
                  <div className="p-card">
                    <div className="p-card-top">
                      <div className="p-av av-navy">JD</div>
                      <div className="p-meta">
                        <div className="p-name">Jayanth Desamsetti</div>
                        <div className="p-uni">Business Analytics · WNE</div>
                      </div>
                    </div>
                    <div className="p-txt">
                      Finally filed Trademark for AroundU! 🎉
                    </div>
                    <div className="p-acts">
                      <span className="p-act">❤️ 24</span>
                      <span className="p-act">💬 8</span>
                      <span className="p-act">↗️</span>
                    </div>
                  </div>
                  <div className="p-card">
                    <div className="p-card-top">
                      <div className="p-av av-teal">MP</div>
                      <div className="p-meta">
                        <div className="p-name">Malavika Polanki</div>
                        <div className="p-uni">BAIM · Springfield, MA</div>
                      </div>
                    </div>
                    <div className="p-img">🌲</div>
                    <div className="p-acts">
                      <span className="p-act">❤️ 42</span>
                      <span className="p-act">💬 12</span>
                    </div>
                  </div>
                  <div className="p-lost">
                    <div className="p-lost-tag">🔴 Lost</div>
                    <div className="p-lost-title">
                      Black Adapter · WNE Campus
                    </div>
                    <div className="p-lost-sub">Posted 6 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <div className="stats-bar reveal">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-num">50+</span>
            <span className="stat-lbl">Universities</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">10K+</span>
            <span className="stat-lbl">Students</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">500+</span>
            <span className="stat-lbl">Professors</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">100%</span>
            <span className="stat-lbl">Verified Users</span>
          </div>
        </div>
      </div> */}

      <section className="features-section" id="features">
        <div className="feat-header reveal">
          <div className="sec-tag"> Everything in One Place</div>
          <h2 className="sec-title">One App. Your Entire Campus Life.</h2>
          <p className="sec-sub">
            From social posts to professor bookings, AroundU has every corner of
            campus life covered in one verified community.
          </p>
        </div>
        <div className="feat-grid">
          <div className="feat-card fc-teal reveal">
            <div className="feat-icon fi-tl">
              <IoPhonePortraitOutline />
            </div>
            <h3>Smart Campus Feed</h3>
            <p>
              Post photos and videos. Filter by your interests, university, or
              exact course to see only what matters to you — no noise, just your
              campus.
            </p>
          </div>
          <div className="feat-card fc-green reveal">
            <div className="feat-icon fi-gn">
              <TbMoneybag />
            </div>
            <h3>Earn with Free Time</h3>
            <p>
              List your available time slots and help fellow students with
              tutoring or tasks. Turn downtime between classNamees into real
              income.
            </p>
          </div>
          <div className="feat-card fc-navy reveal">
            <div className="feat-icon fi-nv">
              <IoMdBook />
            </div>
            <h3>Professor Discovery</h3>
            <p>
              Find trending professors across universities. View their
              availability and book a session directly through AroundU — from
              any campus.
            </p>
          </div>
          <div className="feat-card fc-teal reveal">
            <div className="feat-icon fi-yw">
              <FiShoppingBag />
            </div>
            <h3>Campus Marketplace</h3>
            <p>
              Buy, sell, and trade with verified students at your university.
              Textbooks, electronics, and dorm gear — trusted campus commerce
              only.
            </p>
          </div>
          <div className="feat-card fc-green reveal">
            <div className="feat-icon fi-or">
              <GoPackage />
            </div>
            <h3>Lost &amp; Found Board</h3>
            <p>
              Post lost or found items right on your campus. AroundU's built-in
              board makes recovering belongings fast, simple, and
              community-driven.
            </p>
          </div>
          <div className="feat-card fc-navy reveal">
            <div className="feat-icon fi-pu">
              <IoSearchOutline />
            </div>
            <h3>Explore &amp; Connect</h3>
            <p>
              Discover students and professors beyond your campus. Toggle
              between your university and the wider AroundU network nationwide.
            </p>
          </div>
        </div>
      </section>

      <section className="screens-section" id="screenshots">
        <div className="screens-header reveal">
          <div className="sec-tag"> See It Live</div>
          <h2 className="sec-title">Designed for How Students Actually Live</h2>
          <p className="sec-sub" style={{ margin: "0 auto" }}>
            Clean, intuitive, and built around campus life — AroundU fits right
            into your daily routine.
          </p>
        </div>
        <div className="screens-tabs reveal">
          <button className="tab act"> Home Feed</button>
          <button className="tab"> Lost &amp; Found</button>
          <button className="tab"> Marketplace</button>
          <button className="tab"> Professors</button>
        </div>
        <div className="screens-row reveal">
          <div className="s-mock side">
            <div className="m-hdr">
              <div className="m-logo">
                <span>Around</span>
                <span>U</span>
              </div>
              <div className="m-dots">
                <div className="m-dot"></div>
                <div className="m-dot"></div>
                <div className="m-dot"></div>
              </div>
            </div>
            <div className="m-body">
              <div className="m-search"> Search students...</div>
              <div
                style={{
                  fontSize: "0.52rem",
                  fontWeight: 800,
                  color: "var(--teal)",
                  marginBottom: "6px",
                }}
              >
                People You May Know
              </div>
              <div className="m-card">
                <div className="m-row">
                  <div className="m-av m-av-t"></div>
                  <div className="m-tb">
                    <div className="m-nm"></div>
                    <div className="m-sb"></div>
                  </div>
                </div>
                <div className="m-btn-t">Message</div>
              </div>
              <div className="m-card">
                <div className="m-row">
                  <div className="m-av m-av-g"></div>
                  <div className="m-tb">
                    <div className="m-nm"></div>
                    <div className="m-sb"></div>
                  </div>
                </div>
                <div className="m-btn-t">Message</div>
              </div>
              <div
                style={{
                  fontSize: "0.52rem",
                  fontWeight: 800,
                  color: "var(--navy)",
                  margin: "8px 0 5px",
                }}
              >
                Friend Requests
              </div>
              <div className="m-card">
                <div className="m-row">
                  <div className="m-av"></div>
                  <div className="m-tb">
                    <div className="m-nm"></div>
                    <div className="m-sb"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="s-mock main">
            <div className="m-hdr">
              <div className="m-logo">
                <span>Around</span>
                <span>U</span>
              </div>
              <div className="m-dots">
                <div className="m-dot"></div>
                <div className="m-dot"></div>
                <div className="m-dot"></div>
              </div>
            </div>
            <div className="m-body">
              <div className="m-pill-row">
                <div className="m-pill act">All</div>
                <div className="m-pill">Interests</div>
                <div className="m-pill">Same Uni</div>
                <div className="m-pill">Course</div>
              </div>
              <div className="m-card">
                <div className="m-row">
                  <div className="m-av"></div>
                  <div className="m-tb">
                    <div className="m-nm"></div>
                    <div className="m-sb"></div>
                  </div>
                </div>
                <div className="m-line"></div>
                <div className="m-line sh"></div>
                <div className="m-img">🏔️</div>
                <div className="m-tags">
                  <div className="m-tag m-tag-t">❤️ 42</div>
                  <div className="m-tag m-tag-g">💬 12</div>
                </div>
              </div>
              <div className="m-card">
                <div className="m-row">
                  <div className="m-av m-av-t"></div>
                  <div className="m-tb">
                    <div className="m-nm"></div>
                    <div className="m-sb"></div>
                  </div>
                </div>
                <div className="m-line"></div>
                <div className="m-line sh"></div>
                <div className="m-tags">
                  <div className="m-tag m-tag-t">❤️ 18</div>
                  <div className="m-tag m-tag-g">💬 5</div>
                </div>
              </div>
              <div className="m-lost">
                <div className="m-lost-tag">🔴 Lost</div>
                <div className="m-lost-t">Black Adapter · WNE Campus</div>
                <div className="m-lost-s">Posted 6 days ago</div>
              </div>
            </div>
          </div>

          <div className="s-mock side">
            <div className="m-hdr">
              <div className="m-logo">
                <span>Around</span>
                <span>U</span>
              </div>
              <div className="m-dots">
                <div className="m-dot"></div>
                <div className="m-dot"></div>
                <div className="m-dot"></div>
              </div>
            </div>
            <div className="m-body">
              <div className="m-search">🔍 Search professors...</div>
              <div
                style={{
                  fontSize: "0.52rem",
                  fontWeight: 800,
                  color: "var(--teal)",
                  marginBottom: "6px",
                }}
              >
                Trending Professors
              </div>
              <div className="m-card">
                <div className="m-row">
                  <div className="m-av m-av-g"></div>
                  <div className="m-tb">
                    <div className="m-nm"></div>
                    <div className="m-sb"></div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.43rem",
                    color: "var(--green)",
                    fontWeight: 700,
                    marginBottom: "3px",
                  }}
                >
                  🟢 2 slots available
                </div>
                <div className="m-btn-g">Book Session</div>
              </div>
              <div className="m-card">
                <div className="m-row">
                  <div className="m-av"></div>
                  <div className="m-tb">
                    <div className="m-nm"></div>
                    <div className="m-sb"></div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.43rem",
                    color: "var(--green)",
                    fontWeight: 700,
                    marginBottom: "3px",
                  }}
                >
                  🟢 5 slots available
                </div>
                <div className="m-btn-g">Book Session</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="split-section" id="for-you">
        <div className="split-glow"></div>
        <div className="split-head reveal">
          <div
            className="sec-tag"
            style={{
              background: "rgba(42, 191, 191, 0.15)",
              color: "var(--teal)",
              borderColor: "rgba(42, 191, 191, 0.2)",
            }}
          >
            Two Accounts, One Community
          </div>
          <h2 className="sec-title">Built for Every Corner of Campus</h2>
          <p className="sec-sub">
            Whether you're hitting the books or teaching them, AroundU has a
            space designed exactly for you.
          </p>
        </div>
        <div className="split-inner">
          <div className="s-card s-student reveal">
            <div className="s-chip chip-st">🎓 For Students</div>
            <h2>Make the Most of Every Semester</h2>
            <p>
              Connect, learn, earn money, and build your campus network — all in
              one verified place. AroundU is your academic and social home base.
            </p>
            <ul className="s-perks">
              <li>
                <div className="pk pk-t">✓</div>
                Personalized feed filtered by interests, major &amp; course
              </li>
              <li>
                <div className="pk pk-t">✓</div>
                Connect with students at your uni or across the country
              </li>
              <li>
                <div className="pk pk-t">✓</div>
                List your free time and earn money helping peers
              </li>
              <li>
                <div className="pk pk-t">✓</div>
                Book sessions directly with professors everywhere
              </li>
              <li>
                <div className="pk pk-t">✓</div>
                Buy &amp; sell on the verified campus marketplace
              </li>
              <li>
                <div className="pk pk-t">✓</div>
                Post and recover items on the Lost &amp; Found board
              </li>
            </ul>
            <button
              className="btn-s btn-s-t"
              onClick={() => navigate("/login")}
            >
              Join as Student →
            </button>
          </div>
          <div className="s-card s-prof reveal">
            <div className="s-chip chip-pr"> For Professors</div>
            <h2>Reach Students Beyond Your classNameroom</h2>
            <p>
              Create your verified faculty profile, post your availability, and
              connect with motivated students from any campus who want your
              expertise.
            </p>
            <ul className="s-perks">
              <li>
                <div className="pk pk-g">✓</div>
                Verified faculty profile tied to your institution
              </li>
              <li>
                <div className="pk pk-g">✓</div>
                Post weekly time slots for sessions &amp; office hours
              </li>
              <li>
                <div className="pk pk-g">✓</div>
                Receive booking requests from students anywhere
              </li>
              <li>
                <div className="pk pk-g">✓</div>
                Appear in Trending Professors for wider discovery
              </li>
              <li>
                <div className="pk pk-g">✓</div>
                Direct messaging with enrolled students
              </li>
              <li>
                <div className="pk pk-g">✓</div>
                Build your academic presence across campuses
              </li>
            </ul>
            <button
              className="btn-s btn-s-g"
              onClick={() => navigate("/login")}
              s
            >
              Join as Professor →
            </button>
          </div>
          <div className="s-card s-club reveal">
            <div className="s-chip chip-cl"> For Clubs</div>

            <h2>Build and Grow Your Campus Community</h2>

            <p>
              Create your club profile, share updates, host events, and connect
              with students across campus. AroundU helps your club reach the
              right audience and stay active.
            </p>

            <ul className="s-perks">
              <li>
                <div className="pk pk-b">✓</div>
                Create and manage your club profile
              </li>
              <li>
                <div className="pk pk-b">✓</div>
                Post events, announcements, and updates
              </li>
              <li>
                <div className="pk pk-b">✓</div>
                Reach students within your university instantly
              </li>
              <li>
                <div className="pk pk-b">✓</div>
                Get discovered in trending clubs
              </li>
              <li>
                <div className="pk pk-b">✓</div>
                Engage with members through posts and messages
              </li>
              <li>
                <div className="pk pk-b">✓</div>
                Grow your community and boost participation
              </li>
            </ul>

            <button
              className="btn-s btn-s-b"
              onClick={() => navigate("/login")}
            >
              Join as Club →
            </button>
          </div>
        </div>
      </section>

      {/* <section className="testi-section" id="stories">
        <div className="testi-header reveal">
          <div className="sec-tag">💬 Real Stories</div>
          <h2 className="sec-title">Students &amp; Professors Love AroundU</h2>
          <p className="sec-sub">
            Hear from people already connecting, learning, and earning on
            campus.
          </p>
        </div>
        <div className="testi-grid">
          <div className="t-card reveal">
            <div className="t-quote">"</div>
            <p className="t-text">
              I found three students in my exact major within my first week. We
              formed a study group and I finally feel like I belong on campus.
            </p>
            <div className="t-author">
              <div className="t-av ta1">SK</div>
              <div>
                <div className="t-stars">★★★★★</div>
                <div className="t-name">Sarah K.</div>
                <div className="t-role">
                  Computer Science · Boston University
                </div>
              </div>
            </div>
          </div>
          <div className="t-card reveal">
            <div className="t-quote">"</div>
            <p className="t-text">
              I listed my availability and within a week I was earning money
              helping undergrads with their stats assignments. Absolute game
              changer.
            </p>
            <div className="t-author">
              <div className="t-av ta2">MR</div>
              <div>
                <div className="t-stars">★★★★★</div>
                <div className="t-name">Marcus R.</div>
                <div className="t-role">MBA Student · NYU Stern</div>
              </div>
            </div>
          </div>
          <div className="t-card reveal">
            <div className="t-quote">"</div>
            <p className="t-text">
              As a professor, AroundU lets me connect with motivated students
              from other universities I'd never have reached through my
              institution alone.
            </p>
            <div className="t-author">
              <div className="t-av ta3">PJ</div>
              <div>
                <div className="t-stars">★★★★★</div>
                <div className="t-name">Prof. James T.</div>
                <div className="t-role">
                  Finance · Western New England University
                </div>
              </div>
            </div>
          </div>
          <div className="t-card reveal">
            <div className="t-quote">"</div>
            <p className="t-text">
              Lost my laptop charger before finals. Posted it on AroundU Lost
              &amp; Found and had it back in my hands in two hours. I couldn't
              believe it.
            </p>
            <div className="t-author">
              <div className="t-av ta4">AL</div>
              <div>
                <div className="t-stars">★★★★★</div>
                <div className="t-name">Aisha L.</div>
                <div className="t-role">Pre-Law · Howard University</div>
              </div>
            </div>
          </div>
          <div className="t-card reveal">
            <div className="t-quote">"</div>
            <p className="t-text">
              Sold my old textbooks in under a day and bought next semester's at
              half price from another student. AroundU just saves you money.
            </p>
            <div className="t-author">
              <div className="t-av ta5">TC</div>
              <div>
                <div className="t-stars">★★★★★</div>
                <div className="t-name">Tyler C.</div>
                <div className="t-role">Engineering · Georgia Tech</div>
              </div>
            </div>
          </div>
          <div className="t-card reveal">
            <div className="t-quote">"</div>
            <p className="t-text">
              Being a transfer student is tough. AroundU helped me find people
              in my program immediately. I went from knowing nobody to a real
              friend group.
            </p>
            <div className="t-author">
              <div className="t-av ta6">NP</div>
              <div>
                <div className="t-stars">★★★★★</div>
                <div className="t-name">Nina P.</div>
                <div className="t-role">Psychology · UMass Amherst</div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="cta-section" id="signup">
        <div className="cta-c1"></div>
        <div className="cta-c2"></div>
        <div className="cta-inner reveal">
          <div className="cta-badge"> Free to Join Today</div>
          <h2>
            Ready to Make the Most
            <br />
            of Your College Years?
          </h2>
          <p>
            Join thousands of students and professors already connecting,
            learning, and earning on AroundU. All you need is your university
            email.
          </p>
          <div className="cta-btns">
            <button className="btn-cta-a" onClick={() => navigate("/login")}>
              Sign Up as Student
            </button>
            <button className="btn-cta-b" onClick={() => navigate("/login")}>
              Sign Up as Professor
            </button>
          </div>
          <p className="cta-note">
            University email required &nbsp;·&nbsp; Free forever &nbsp;·&nbsp;
            No fake accounts &nbsp;·&nbsp; ® Trademarked
          </p>
        </div>
      </section>

      <footer>
        <div className="foot-inner">
          <div className="foot-brand">
            <a href="#" className="foot-logo">
              <img src="/logo.png" alt="AroundU" />
              <div className="foot-logo-t">
                <span>Around</span>
                <span>U</span>
              </div>
            </a>
            <p>
              The campus social platform built exclusively for verified college
              students and faculty. Connect, learn, earn, and thrive.
            </p>
          </div>
          <div className="foot-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <a href="#">Home Feed</a>
              </li>
              <li>
                <a href="#">Explore</a>
              </li>
              <li>
                <a href="#">Marketplace</a>
              </li>
              <li>
                <a href="#">Lost &amp; Found</a>
              </li>
              <li>
                <a href="#">Messages</a>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Press</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Cookie Policy</a>
              </li>
              <li>
                <a href="#">DMCA</a>
              </li>
              <li>
                <a href="#">Accessibility</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <div className="foot-copy">
            © 2026 AroundU, Inc. All rights reserved. ® Registered Trademark.
          </div>
          <div className="foot-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </>
  );
}

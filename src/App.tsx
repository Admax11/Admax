import { useEffect, useMemo, useState } from 'react';
import { auth, api } from '@appdeploy/client';
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  Github,
  Globe2,
  Layers3,
  LogIn,
  LogOut,
  Plus,
  Search,
  Smartphone,
  Trash2,
  X,
  UploadCloud,
  Pencil,
  Sparkles,
} from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  imageUrl?: string;
  featured?: boolean;
  createdAt?: string;
};
const SOCIAL_URL = 'https://admax-social-lhv5bp.v2.appdeploy.ai/';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Web App',
    url: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function load() {
    try {
      const [u, p] = await Promise.all([
        auth.getUser(),
        api.get('/api/projects'),
      ]);
      setUser(u);
      setIsAdmin(
        Boolean(u?.email?.toLowerCase() === 'adumaxwell298@gmail.com')
      );
      setProjects(p.data.projects || []);
    } catch (e) {
      setMessage('Could not load projects. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map(p => p.category)))],
    [projects]
  );
  const filtered = projects.filter(
    p =>
      (category === 'All' || p.category === category) &&
      (p.title + ' ' + p.description)
        .toLowerCase()
        .includes(search.toLowerCase())
  );
  function openNew() {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      category: 'Web App',
      url: '',
      imageUrl: '',
    });
    setImageFile(null);
    setShowForm(true);
  }
  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      category: p.category,
      url: p.url,
      imageUrl: p.imageUrl || '',
    });
    setImageFile(null);
    setShowForm(true);
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.url.trim())
      return setMessage(
        'Please complete the project title, description and live app link.'
      );
    try {
      setBusy(true);
      setMessage('');
      let result;
      if (editing) result = await api.put('/api/projects/' + editing.id, form);
      else result = await api.post('/api/projects', form);
      const id = editing?.id || result.data.id;
      if (imageFile && id) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(String(reader.result).split(',')[1] || '');
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        await api.post('/api/projects/' + id + '/image', {
          base64,
          contentType: imageFile.type,
        });
      }
      setShowForm(false);
      await load();
      setMessage(
        editing ? 'Project updated.' : 'Project published to your portfolio.'
      );
    } catch (err: any) {
      setMessage(
        err?.response?.data?.error ||
          'Could not save the project. Check the details and try again.'
      );
    } finally {
      setBusy(false);
    }
  }
  async function removeProject(p: Project) {
    if (!confirm('Remove ' + p.title + ' from your portfolio?')) return;
    try {
      await api.delete('/api/projects/' + p.id);
      await load();
      setMessage('Project removed.');
    } catch {
      setMessage('Could not remove this project.');
    }
  }
  async function signIn() {
    try {
      await auth.signInWithRedirect();
    } catch {
      setMessage(
        'Sign-in did not start. Please try again and allow browser storage.'
      );
    }
  }
  async function signOut() {
    await auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }

  return (
    <div className="site-shell">
      <nav className="nav wrap">
        <a className="brand" href="#">
          <span className="brand-mark">A</span>
          <span>
            ADMAX<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="#app-store">App Store</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          {isAdmin ? (
            <button className="nav-admin" onClick={openNew}>
              <Plus size={16} /> Add project
            </button>
          ) : user ? (
            <span className="signed-in">Signed in</span>
          ) : (
            <button className="nav-login" onClick={signIn}>
              <LogIn size={15} /> Admin
            </button>
          )}
          {isAdmin && (
            <button className="icon-btn" title="Sign out" onClick={signOut}>
              <LogOut size={17} />
            </button>
          )}
        </div>
      </nav>
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="pulse" /> INDEPENDENT DEVELOPER & DIGITAL CREATOR
            </div>
            <h1>
              Ideas into
              <br />
              <span>digital reality.</span>
            </h1>
            <p className="hero-text">
              I'm ADMAX — building useful apps, digital experiences and tools
              that make everyday work easier. Explore what I've created.
            </p>
            <div className="hero-actions">
              <a className="primary-btn" href="#work">
                Explore my work <ArrowUpRight size={18} />
              </a>
              <a className="secondary-btn" href="#contact">
                Let's connect
              </a>
            </div>
            <div className="hero-meta">
              <span>
                <Code2 size={15} /> App development
              </span>
              <span>
                <Globe2 size={15} /> Web experiences
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-core">
              <span className="core-small">BUILDING</span>
              <strong>
                AD
                <br />
                MAX
              </strong>
              <span className="core-line" />
              <span className="core-small">
                DIGITAL • CREATIVE • INNOVATIVE
              </span>
            </div>
            <div className="float-card card-top">
              <Sparkles size={16} /> Creative ideas
            </div>
            <div className="float-card card-bottom">
              <Layers3 size={16} /> Real projects
            </div>
          </div>
        </section>
        <section className="ticker">
          <div>
            DESIGN <b>✳</b> DEVELOP <b>✳</b> CREATE <b>✳</b> INNOVATE <b>✳</b>{' '}
            DESIGN <b>✳</b> DEVELOP <b>✳</b> CREATE <b>✳</b> INNOVATE
          </div>
        </section>
        <section className="section wrap" id="app-store">
          <div className="section-head">
            <div>
              <div className="eyebrow">THE ADMAX APP STORE</div>
              <h2>
                Explore my <span>built.</span>
              </h2>
              <p className="section-sub">
                Discover the apps, tools and digital experiences built by ADMAX. Choose an app to explore it.
              </p>
            </div>
            <div className="work-count">
              <strong>{projects.length + 1}</strong>
              <span>APPS IN STORE</span>
            </div>
          </div>
          <div className="featured-card">
            <div className="featured-visual">
              <div className="social-window">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="social-logo">
                  ADMAX<span>SOCIAL</span>
                </div>
                <div className="social-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="social-bubble">Connect. Create. Share.</div>
              </div>
              <span className="visual-tag">FEATURED PROJECT</span>
            </div>
            <div className="featured-info">
              <div className="project-type">01 / SOCIAL PLATFORM</div>
              <h3>Admax Social</h3>
              <p>
                A social platform project designed around sharing, profiles and
                connecting with a community.
              </p>
              <div className="tags">
                <span>Social</span>
                <span>Web App</span>
                <span>Community</span>
              </div>
              <a
                className="text-link"
                href={SOCIAL_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open Admax Social <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <div className="store-intro">
            <div>
              <div className="eyebrow">BROWSE • DISCOVER • LAUNCH</div>
              <h3>Find an app for <span>what you need.</span></h3>
              <p>Every listing takes you directly to its live application. New projects will be added here as they are published.</p>
            </div>
            <div className="store-metrics">
              <div><strong>{projects.length + 1}</strong><span>LIVE LISTINGS</span></div>
              <div><strong>{categories.length - 1}</strong><span>CATEGORIES</span></div>
            </div>
          </div>
          <div className="project-toolbar">
            <div className="filter-row">
              {categories.map(c => (
                <button
                  key={c}
                  className={category === c ? 'filter active' : 'filter'}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search apps by name or description"
              />
            </label>
          </div>
          {loading ? (
            <div className="empty-state">Loading portfolio…</div>
          ) : filtered.length ? (
            <div className="project-grid">
              {filtered.map((p, i) => (
                <article className="project-card" key={p.id}>
                  <div className="project-image">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} />
                    ) : (
                      <div className="image-placeholder">
                        <Code2 size={38} />
                        <span>
                          ADMAX PROJECT / {String(i + 2).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="card-tools">
                        <button onClick={() => openEdit(p)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => removeProject(p)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="project-card-body">
                    <div className="project-type">{p.category}</div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <a
                      className="text-link"
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Launch app <ArrowUpRight size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No projects match that search yet.
            </div>
          )}
          {isAdmin && (
            <button className="add-card" onClick={openNew}>
              <Plus size={19} /> Add another app to the store
            </button>
          )}
        </section>
        <section className="about-section" id="about">
          <div className="wrap about-grid">
            <div>
              <div className="eyebrow">A LITTLE ABOUT ME</div>
              <h2>
                Curious mind.
                <br />
                <span>Builder's mindset.</span>
              </h2>
            </div>
            <div className="about-copy">
              <p>
                I enjoy turning ideas into practical digital products. This
                portfolio is where I share the apps and experiments I'm working
                on, with direct links so you can explore them.
              </p>
              <div className="about-points">
                <span>
                  <Code2 /> App development
                </span>
                <span>
                  <Smartphone /> Digital products
                </span>
                <span>
                  <Globe2 /> Web solutions
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="contact-section wrap" id="contact">
          <div className="contact-box">
            <div>
              <div className="eyebrow">HAVE AN IDEA?</div>
              <h2>
                Let's make it <span>happen.</span>
              </h2>
              <p>Have a project or collaboration in mind? Get in touch.</p>
            </div>
            <a className="primary-btn" href="mailto:adumaxwell298@gmail.com">
              Contact ADMAX <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
      </main>
      <footer className="footer wrap">
        <a className="brand" href="#">
          <span className="brand-mark">A</span>
          <span>
            ADMAX<span className="brand-dot">.</span>
          </span>
        </a>
        <span>© {new Date().getFullYear()} ADMAX. Built with purpose.</span>
        <a href={SOCIAL_URL} target="_blank" rel="noreferrer">
          Admax Social <ExternalLink size={13} />
        </a>
      </footer>
      {message && (
        <div className="toast" role="status">
          {message}
          <button onClick={() => setMessage('')}>
            <X size={15} />
          </button>
        </div>
      )}
      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <form className="project-modal" onSubmit={saveProject}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">PORTFOLIO MANAGER</div>
                <h3>{editing ? 'Edit project' : 'Add a project'}</h3>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowForm(false)}
              >
                <X />
              </button>
            </div>
            <label>
              Project name
              <input
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Admax Data Bundles"
              />
            </label>
            <label>
              Description
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What does this app do?"
              />
            </label>
            <div className="form-row">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option>Web App</option>
                  <option>Mobile App</option>
                  <option>Education</option>
                  <option>Business</option>
                  <option>Game</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Live app URL
                <input
                  required
                  type="url"
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://…"
                />
              </label>
            </div>
            <label>
              Project cover image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
              />
              <small>Optional · PNG, JPG or WebP · up to 3 MB</small>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" disabled={busy}>
                {busy ? (
                  'Saving…'
                ) : (
                  <>
                    <UploadCloud size={17} />{' '}
                    {editing ? 'Save changes' : 'Publish project'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export default App;

import './App.css'
import { Routes, Route, Link, useNavigate } from 'react-router'
import { Home } from './components/Home.jsx'
import { Blog } from './components/Blog.jsx'
import { Contact } from './components/Contact.jsx'
import { Post } from './components/Post.jsx'
import { Author } from './components/Author.jsx'
import NewPost from './components/NewPost.jsx'
import Login from './components/Login.jsx'

function App() {
  const navigate = useNavigate()

  function handleLogout() {
    fetch(import.meta.env.VITE_API_URL + '/logout', { credentials: 'include' })
    .then(() => navigate('/login'))
    .catch((error) => console.log(error))
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/">Inicio</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/nuevo">Nuevo Post</Link>
        <Link to="/contacto">Contacto</Link>
        <Link to="/login">Iniciar sesión</Link>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id_post" element={<Post />} />
        <Route path="/autores/:id_author" element={<Author />} />
        <Route path="/nuevo" element={<NewPost />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App

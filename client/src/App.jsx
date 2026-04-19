import './App.css'
import { Routes, Route, Link } from 'react-router'
import { Home } from './components/Home.jsx'
import { Blog } from './components/Blog.jsx'
import { Contact } from './components/Contact.jsx'
import { Post } from './components/Post.jsx'
import { Author } from './components/Author.jsx'
import NewPost from './components/NewPost.jsx'

function App() {
  return (
    <>
      <nav className="navbar">
        <Link to="/">Inicio</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/nuevo">Nuevo Post</Link>
        <Link to="/contacto">Contacto</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id_post" element={<Post />} />
        <Route path="/autores/:id_author" element={<Author />} />
        <Route path="/nuevo" element={<NewPost />} />
        <Route path="/contacto" element={<Contact />} />
      </Routes>
    </>
  )
}

export default App

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'

export function Post() {
    const { id_post } = useParams()
    const [post, setPost] = useState({})

    useEffect(() => {
        fetch(import.meta.env.VITE_API_URL + '/posts/' + id_post)
        .then((res) => res.json())
        .then((data) => setPost(data))
        .catch((error) => console.log(error))
    }, [id_post])

    return (
        <div style={{ padding: '2rem' }}>
            {post.img && <img src={'../src/assets/uploads/' + post.img} alt="Imagen del post" style={{ maxWidth: '400px' }} />}
            <h1>{post.title}</h1>
            <h2>Escrito por: <Link to={'/autores/' + post.author_id}>{post.author_name}</Link></h2>
            <p>{post.date ? post.date.substring(0, 10) : ''}</p>
            <p>{post.text}</p>
        </div>
    )
}

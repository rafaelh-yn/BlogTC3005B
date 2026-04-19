import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { CardList } from './Card'

export function Author() {
    const { id_autor } = useParams()
    const [autor, setAutor] = useState({})
    const [posts, setPosts] = useState([])

    useEffect(() => {
        fetch('http://localhost:8000/autores/' + id_autor)
        .then((res) => res.json())
        .then((data) => setAutor(data))
        .catch((error) => console.log(error))

        fetch('http://localhost:8000/autores/' + id_autor + '/posts')
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((error) => console.log(error))
    }, [id_autor])

    return (
        <div style={{ padding: '2rem' }}>
            <h1>{autor.name}</h1>
            <h2>Posts</h2>
            <CardList entries={posts} filteredText='' />
        </div>
    )
}

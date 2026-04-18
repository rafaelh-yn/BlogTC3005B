import { useState, useEffect } from 'react'
import { CardList } from './Card.jsx'

export function Blog() {
    const [entries, setEntries] = useState([])
    const [filteredText, setFilteredText] = useState('')

    useEffect(() => {
        fetch('http://localhost:8000/posts')
        .then((res) => res.json())
        .then((posts) => setEntries(posts))
        .catch((error) => console.log(error))
    }, [])

    function handleChange(e) {
        setFilteredText(e.target.value)
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Blog de Mascotas</h1>
            <div>
                <label>Buscar por título: </label>
                <input type='text' value={filteredText} onChange={handleChange} />
            </div>
            <CardList entries={entries} filteredText={filteredText} />
        </div>
    )
}

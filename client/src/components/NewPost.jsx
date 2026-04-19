import { useState, useEffect } from 'react'

export default function NewPost() {
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [date, setDate] = useState('')
    const [img, setImg] = useState(null)
    const [authorId, setAuthorId] = useState('')
    const [authors, setAuthors] = useState([])

    useEffect(() => {
        fetch('http://localhost:8000/autores')
        .then((res) => res.json())
        .then((data) => setAuthors(data))
        .catch((error) => console.log(error))
    }, [])

    function handleTitleChange(e) {
        setTitle(e.target.value)
    }

    function handleTextChange(e) {
        setText(e.target.value)
    }

    function handleDateChange(e) {
        setDate(e.target.value)
    }

    function handleFile(e) {
        const fileInfo = {
            file: e.target.files[0],
            filename: e.target.files[0].name
        }
        setImg(fileInfo)
    }

    function handleSubmit() {
        const formInfo = new FormData()
        formInfo.append('title', title)
        formInfo.append('text', text)
        formInfo.append('date', date)
        formInfo.append('author_id', authorId)
        if (img) {
            formInfo.append('img', img.file, img.filename)
        }
        fetch('http://localhost:8000/posts/new', {
            method: 'POST',
            body: formInfo,
        })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((error) => console.log(error))
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Nuevo Post</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                <div>
                    <label>Título: </label>
                    <input type='text' value={title} onChange={handleTitleChange} />
                </div>
                <div>
                    <label>Texto: </label>
                    <textarea value={text} onChange={handleTextChange} rows={4} style={{ width: '100%' }} />
                </div>
                <div>
                    <label>Fecha: </label>
                    <input type='date' value={date} onChange={handleDateChange} />
                </div>
                <div>
                    <label>Autor: </label>
                    <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
                        <option value=''>-- Selecciona un autor --</option>
                        {authors.map((author) => (
                            <option key={author.id_author} value={author.id_author}>
                                {author.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Imagen: </label>
                    <input type='file' onChange={handleFile} />
                </div>
                <input type='submit' value='Crear Post' onClick={handleSubmit} />
            </div>
        </div>
    )
}

import { Link } from 'react-router'

export function CardList({ entries, filteredText }) {
    const cards = [...entries]
        .filter(entry => entry.title.toLowerCase().includes(filteredText.toLowerCase()))
        .map(entry => (
            <Card
                key={entry.id_post}
                id_post={entry.id_post}
                title={entry.title}
                date={entry.date}
                img={entry.img}
            />
        ))
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
            {cards}
        </div>
    )
}

export function Card({ id_post, img, title, date }) {
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', width: '200px', borderRadius: '8px' }}>
            <Link to={'/blog/' + id_post} style={{ textDecoration: 'none', color: '#333' }}>
                {img && <img src={'../src/assets/uploads/' + img} alt="Imagen del post" style={{ width: '100%' }} />}
                <h2>{title}</h2>
                <p>{date ? date.substring(0, 10) : ''}</p>
            </Link>
        </div>
    )
}

export default function PlaceGallery({ images, placeName, variant = 'compact' }) {
  if (!images?.length) return null

  return (
    <div className={`place-gallery place-gallery--${variant}`}>
      {images.map((image) => (
        <a
          key={image.src}
          className="place-gallery__item"
          href={image.href ?? image.src}
          target="_blank"
          rel="noreferrer noopener"
        >
          <img src={image.src} alt={`${placeName}: ${image.title}`} loading="lazy" />
          <span className="place-gallery__caption">
            {image.title}
            <span className="place-gallery__credit">{image.credit}</span>
          </span>
        </a>
      ))}
    </div>
  )
}

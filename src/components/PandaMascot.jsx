export default function PandaMascot({ size = 90 }) {
  return (
    <div className="flex flex-col items-center">
      <img
        src="/cupido.png"
        alt="Cupido"
        style={{ width: size, height: size, objectFit: 'contain' }}
        draggable={false}
      />
    </div>
  )
}

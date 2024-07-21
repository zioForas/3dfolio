import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import { Vector3, Mesh } from 'three'

interface NavButtonProps {
  position: Vector3
  label: string
  onClick: () => void
}

const NavButton: React.FC<NavButtonProps> = ({ position, label, onClick }) => {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<Mesh>(null)

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.x = ref.current.scale.y = ref.current.scale.z = hovered ? 1.1 : 1
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
      <Text position={[0, 0.7, 0]} fontSize={0.2}>
        {label}
      </Text>
    </group>
  )
}

interface MenuItem {
  label: string
  onClick: () => void
}

interface PopupMenuProps {
  position: [number, number, number]
  items: MenuItem[]
  onClose: () => void
}

const PopupMenu: React.FC<PopupMenuProps> = ({ position, items, onClose }) => {
  return (
    <Html position={position}>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        {items.map((item, index) => (
          <button
            key={index}
            className="block w-full text-left py-2 px-4 text-white hover:bg-gray-700 rounded"
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
        <button
          className="mt-2 w-full text-center py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Html>
  )
}

const Navigation3D: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const menuItems: Record<string, MenuItem[]> = {
    projects: [
      { label: 'Project 1', onClick: () => console.log('Project 1 clicked') },
      { label: 'Project 2', onClick: () => console.log('Project 2 clicked') },
    ],
    about: [
      { label: 'Skills', onClick: () => console.log('Skills clicked') },
      { label: 'Experience', onClick: () => console.log('Experience clicked') },
    ],
  }

  return (
    <group>
      <NavButton
        position={new Vector3(-2, 0, 0)}
        label="Projects"
        onClick={() => setActiveMenu('projects')}
      />
      <NavButton
        position={new Vector3(2, 0, 0)}
        label="About"
        onClick={() => setActiveMenu('about')}
      />
      {activeMenu && (
        <PopupMenu
          position={[0, 1, 0]}
          items={menuItems[activeMenu]}
          onClose={() => setActiveMenu(null)}
        />
      )}
    </group>
  )
}

export default Navigation3D

export default function Header() {
    return (
      <header className="fixed top-0 left-0 right-0 bg-blue-600 text-white z-10 shadow-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="text-xl font-bold">Logo</div>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="/" className="hover:underline">Inicio</a></li>
              <li><a href="/acerca" className="hover:underline">payment</a></li>
              <li><a href="/contacto" className="hover:underline">products</a></li>
            </ul>
          </nav>
        </div>
      </header>
    );
}
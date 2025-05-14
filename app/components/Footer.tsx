export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Mi Aplicación. Todos los derechos reservados.
            </div>
            <div className="flex space-x-4">
              <a href="/terminos" className="hover:underline">Términos</a>
              <a href="/privacidad" className="hover:underline">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }
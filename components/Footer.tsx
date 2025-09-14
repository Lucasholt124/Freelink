// Em /components/Footer.tsx
// (Crie este novo arquivo)

import Link from "next/link";
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Coluna do Logo e Social */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
              Freelinnk<span className="text-purple-600">.</span>
            </Link>
            <p className="text-gray-500 text-sm">
              A plataforma definitiva para criadores de conteúdo no Brasil.
            </p>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition">
                <FaTwitter size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Colunas de Links */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Produto</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/#features" className="text-base text-gray-500 hover:text-gray-900">Recursos</Link></li>
                <li><Link href="/#pricing" className="text-base text-gray-500 hover:text-gray-900">Preços</Link></li>
                <li><Link href="/dashboard/mentor-ia" className="text-base text-gray-500 hover:text-gray-900">Mentor IA</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Empresa</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Sobre nós</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/terms-of-service" className="text-base text-gray-500 hover:text-gray-900">Termos de Serviço</Link></li>
                <li><Link href="/privacy-policy" className="text-base text-gray-500 hover:text-gray-900">Política de Privacidade</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Freelinnk (um produto Impulsioneweb). Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
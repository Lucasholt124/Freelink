import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Palette,
  Shield,
  Smartphone,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const features = [
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Totalmente personalizável",
    description:
      "Personalize sua página de links com temas, cores e layouts que combinam com sua marca.",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Análise Avançada",
    description:
      "Monitore cliques, entenda seu público e otimize seu conteúdo com insights e relatórios detalhados.",
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Otimizado para dispositivos móveis",
    description:
      "Sua página fica perfeita em todos os dispositivos, de computadores a celulares.",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Rápido como um raio",
    description:
      "Tempos de carregamento instantâneos e uma experiência de usuário suave.",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Seguro e confiável",
    description:
      "Segurança de nível empresarial com 99,9% de disponibilidade garantida.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Colaboração em equipe",
    description:
      "Gerencie e otimize suas páginas em conjunto com sua equipe.",
  },
];


const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Criadora de conteúdo",
    content:
      "O Freelink transformou a forma como compartilho meu conteúdo. As análises me ajudam a entender o que meu público mais gosta!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Proprietário de pequena empresa",
    content:
      "Perfeito para o meu negócio. Limpo, profissional e meus clientes conseguem encontrar facilmente todos os meus links importantes.",
    rating: 5,
  },
  {
    name: "Anna Alves",
    role: "Artista",
    content:
      "As opções de personalização são incríveis. Minha página de links combina perfeitamente com minha marca e estilo artístico.",
    rating: 5,
  },
];
const Home = async () => {
    const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }


  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Hero Section */}
      <Header isFixed={true} />

      <section className="px-4 py-20 lg:px-8 lg:py-32">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-balance">
            Um Link
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Infinitas Possibilidades
            </span>
          </h1>

          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto" />

          <p className="text-lg lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-balance">
            Crie uma página de links na bio linda e personalizável. Ideal para
            criadores, empresas e qualquer pessoa que queira compartilhar vários links com facilidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-5 h-auto font-semibold shadow-md"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                Comece gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white text-lg px-8 py-5 h-auto font-semibold"
            >
              <Link href="#features">Veja como funciona</Link>
            </Button>
          </div>

          <div className="pt-12 space-y-4">
            <p className="text-sm text-gray-500">
              Mais de 10.000 criadores confiam no Freelink
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-400 text-xl font-semibold opacity-80">
              <span>Criadores</span>
              <span>Negócios</span>
              <span>Influenciadores</span>
              <span>Artistas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">Tudo o que você precisa</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-balance">
              Recursos poderosos para você compartilhar seu conteúdo e crescer seu público.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="text-purple-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 lg:p-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Crie sua página em minutos e junte-se a milhares de criadores que confiam no Freelink.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-5 h-auto font-semibold shadow-sm"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                Crie seu Freelink
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm opacity-80">
              {[
                "Comece grátis",
                "Não precisa de cartão",
                "Configuração em 15 segundos",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

       {/* Social Proof Section */}
      <section className="px-4 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Amado pelos criadores
            </h2>
            <p className="text-xl text-gray-600">
              Veja o que nossos usuários estão dizendo sobre o Freelink
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* CTA Section */}
      <section className="px-4 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 lg:p-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a milhares de criadores que confiam no Linkify para exibir seu
conteúdo. Crie sua linda página de links em minutos, não em horas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto font-semibold"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  Crie seu Freelink
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Livre para começar
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Não é necessário cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Configuração em 15 segundos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">Freelink</h3>
              <p className="text-gray-600 text-sm">
                A forma mais fácil de reunir e compartilhar todos os seus links em uma página incrível.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Características</li>
                <li>Preços</li>
                <li>Análise</li>
                <li>Integrações</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Contato</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Comunidade</li>
                <li>Status</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
  &copy; 2025{" "}
  <a
    href="https://mysite-eog7.vercel.app/"
    target="_blank"
    rel="noopener noreferrer"
    className="underline hover:text-purple-600 transition-colors"
  >
    Impulsioneweb
  </a>
  . Todos os direitos reservados.
</div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
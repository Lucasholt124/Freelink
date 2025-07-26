"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import { useParams } from "next/navigation";
import { Doc } from "@/convex/_generated/dataModel";
import { trackLinkClick } from "@/lib/analytics";

function Links({
  preloadedLinks,
}: {
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksBySlug>;
}) {
  // Log para saber se o componente está sendo renderizado
  console.log("Renderizando Links");

  const links = usePreloadedQuery(preloadedLinks);
  const params = useParams();
  const username = params.username as string;

  // Log para ver o que está vindo dos links
  console.log("Links recebidos:", links);

  const handleLinkClick = async (link: Doc<"links">) => {
    // Debug: veja se o tracking está sendo chamado
    console.log("Tracking clique:", {
      profileUsername: username,
      linkId: link._id,
      linkTitle: link.title,
      linkUrl: link.url,
    });

    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitorId", visitorId);
    }
    await trackLinkClick({
      profileUsername: username,
      linkId: link._id,
      linkTitle: link.title,
      linkUrl: link.url,
      visitorId,
    });
  };

  // Se o componente não está renderizando, tente este fallback
  if (!links || !Array.isArray(links)) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-300 mb-6">
          <ArrowUpRight className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-slate-400 text-xl font-medium">Erro ao carregar links</p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-300 mb-6">
          <ArrowUpRight className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-slate-400 text-xl font-medium">Nenhum link ainda</p>
        <p className="text-slate-300 text-sm mt-2 font-medium">
          Os links aparecerão aqui em breve
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link, index) => (
        <a
          key={link._id}
          href={typeof link.url === "string" ? link.url : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group block w-full"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={async (e) => {
            e.preventDefault();
            await handleLinkClick(link);
            if (typeof link.url === "string") {
              window.open(link.url, "_blank", "noopener,noreferrer");
            }
          }}
        >
          <div className="relative bg-white/70 hover:bg-white/90 border border-slate-200/50 hover:border-slate-300/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-blue-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/20 group-hover:to-blue-50/30 rounded-2xl transition-all duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-200 mb-1">
                  {typeof link.title === "string" ? link.title : JSON.stringify(link.title)}
                </h3>
                <p className="text-xs italic text-slate-400 group-hover:text-slate-500 transition-colors duration-200 truncate font-normal">
                  {typeof link.url === "string"
                    ? link.url.replace(/^https?:\/\//, "")
                    : JSON.stringify(link.url)}
                </p>
              </div>
              <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-hover:translate-x-0.5">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default Links;
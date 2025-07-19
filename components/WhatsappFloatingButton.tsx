"use client";

export default function WhatsappFloatingButton() {
  return (
    <a
      href="https://wa.me/+5579999383543?text=Ol%C3%A1%2C+gostaria+de+falar+com+o+time+do+Freelink"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale com o time no WhatsApp"
      className="fixed z-50 bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition"
      style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.15)" }}
    >
      {/* SVG do ícone do WhatsApp */}
      <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
        className="w-8 h-8"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#25D366" />
        <path
          d="M23.472 19.339c-.355-.177-2.104-1.037-2.43-1.155-.326-.119-.563-.177-.8.177-.237.355-.914 1.155-1.122 1.392-.208.237-.414.266-.769.089-.355-.178-1.5-.553-2.86-1.763-1.057-.944-1.77-2.108-1.98-2.463-.208-.355-.022-.546.156-.723.16-.159.355-.414.533-.622.178-.208.237-.355.355-.592.119-.237.06-.444-.03-.622-.089-.178-.8-1.924-1.096-2.637-.289-.693-.583-.599-.8-.61-.208-.009-.444-.011-.68-.011-.237 0-.622.089-.948.444-.326.355-1.24 1.211-1.24 2.955 0 1.744 1.27 3.429 1.447 3.666.178.237 2.5 3.82 6.055 5.209.847.291 1.507.464 2.023.593.85.203 1.624.174 2.236.106.682-.075 2.104-.859 2.402-1.691.297-.832.297-1.545.208-1.691-.089-.148-.326-.237-.68-.414z"
          fill="#fff"
        />
      </svg>
    </a>
  );
}
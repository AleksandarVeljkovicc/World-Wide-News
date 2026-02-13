interface SocialIconsProps {
  linkClassName?: string;
}

export default function SocialIcons({ linkClassName }: SocialIconsProps) {
  return (
    <>
      <a className={linkClassName} href="#" aria-label="Facebook">
        <i className="fa-brands fa-facebook-f"></i>
      </a>
      <a className={linkClassName} href="#" aria-label="Twitter">
        <i className="fa-brands fa-twitter"></i>
      </a>
      <a className={linkClassName} href="#" aria-label="Instagram">
        <i className="fa-brands fa-instagram"></i>
      </a>
    </>
  );
}

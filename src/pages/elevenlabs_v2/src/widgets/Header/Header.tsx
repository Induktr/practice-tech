import { HeaderProps } from "@/shared/types/components/header";
import { type FC } from "react";

export const Header: FC<HeaderProps> = ({ className, children, ...props }) => {
  return (
    <header className={className} {...props}>
      {children}
    </header>
  );
};

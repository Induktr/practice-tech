import { HeaderProps } from "@/shared/types/components/header";
import { type FC } from "react";

export const Header: FC<HeaderProps> = ({ className, children  }) => {
  return (
    <header className={className}>
      {children}
    </header>
  );
}

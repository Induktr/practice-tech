import { AnnBannerProps } from "@/shared/types/components/ann_banner";
import { Card } from "@/shared/ui/card";
import { type FC } from "react";

export const AnnBanner: FC<AnnBannerProps> = ({ className, children, ...props }) => {
  return (
    <Card className={className} {...props}>
      {children}
    </Card>
  );
};

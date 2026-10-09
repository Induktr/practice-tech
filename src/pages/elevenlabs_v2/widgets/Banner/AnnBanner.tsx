import { AnnBannerProps } from "@/shared/types/components/ann_banner";
import { Card } from "@/shared/ui/card";
import { ReactNode, type FC } from "react";

export const AnnBanner: FC<AnnBannerProps> = ({ className, children  }) => {
  return (
    <Card className={className as string}>
      {children as ReactNode}
    </Card>
  );
}

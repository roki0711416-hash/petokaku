"use client";

import { createContext, useContext, useMemo, type MouseEvent, type ReactNode } from "react";
import { isAffiliateHref, outboundAnchorRel, pageContextFromLocation, shopFromDestination, trackShopClick } from "@/lib/analytics";

type ShopClickScopeValue = {
  pageType: string | null;
  productId: string | null;
  productName: string | null;
};

const emptyScope: ShopClickScopeValue = {
  pageType: null,
  productId: null,
  productName: null,
};

const ShopClickScopeContext = createContext<ShopClickScopeValue>(emptyScope);

export function ShopClickScope({
  pageType,
  productId,
  productName,
  children,
}: {
  pageType: string;
  productId?: string | null;
  productName?: string | null;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      pageType,
      productId: productId ?? null,
      productName: productName ?? null,
    }),
    [pageType, productId, productName],
  );
  return <ShopClickScopeContext.Provider value={value}>{children}</ShopClickScopeContext.Provider>;
}

export function ShopOutboundLink({
  href,
  affiliate = false,
  shop,
  shopName,
  price,
  position,
  productId,
  productName,
  pageType,
  className,
  children,
}: {
  href: string;
  affiliate?: boolean;
  shop?: string | null;
  shopName?: string | null;
  price?: number | null;
  position?: number | null;
  productId?: string | null;
  productName?: string | null;
  pageType?: string | null;
  className?: string;
  children: ReactNode;
}) {
  const scope = useContext(ShopClickScopeContext);
  const sponsored = affiliate || isAffiliateHref(href);

  function record() {
    const located = pageContextFromLocation(window.location.pathname, document.title);
    trackShopClick({
      shop: shopFromDestination(href, shop),
      shopName,
      productId: productId ?? scope.productId ?? located.productId,
      productName: productName ?? scope.productName ?? located.productName,
      price,
      pageType: pageType ?? scope.pageType ?? located.pageType,
      position,
    });
  }

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }
    record();
  }

  function onAuxClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 1) {
      return;
    }
    record();
  }

  return (
    <a href={href} target="_blank" rel={outboundAnchorRel(sponsored)} className={className} onClick={onClick} onAuxClick={onAuxClick}>
      {children}
    </a>
  );
}

"use client";

import { createClient, OAuthStrategy } from "@wix/sdk";
import { products, collections } from "@wix/stores";

const myWixClient = createClient({
  modules: {
    products,
    // currentCart
  },
  auth: OAuthStrategy({
    clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID,
    tokens: {
      accessToken: {
        value: "<ACCESS_TOKEN_VALUE>",
        expiresAt: "<ACCESS_TOKEN_EXPIRY_DATE>",
      },
      refreshToken: {
        value: "<REFRESH_TOKEN_VALUE>",
      },
    },
  }),
});

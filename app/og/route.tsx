import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "poc to prod";
    const description = searchParams.get("description") || "Notes, guides, and deep-dives on software engineering & infrastructure.";
    const category = searchParams.get("category") || "Wiki & Engineering";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#09090b",
            backgroundImage: "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #18181b 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            color: "#fafafa",
            padding: "60px 80px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Top Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "20px",
                  color: "#ffffff",
                }}
              >
                P
              </div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  letterSpacing: "-0.02em",
                  color: "#f4f4f5",
                }}
              >
                poc to prod
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#27272a",
                padding: "6px 16px",
                borderRadius: "9999px",
                fontSize: "16px",
                fontWeight: "500",
                color: "#a1a1aa",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {category}
            </div>
          </div>

          {/* Main Content Area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "1000px",
            }}
          >
            <h1
              style={{
                fontSize: title.length > 50 ? "52px" : "64px",
                fontWeight: "800",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "#ffffff",
                margin: 0,
              }}
            >
              {title}
            </h1>
            {description && (
              <p
                style={{
                  fontSize: "26px",
                  lineHeight: 1.4,
                  color: "#a1a1aa",
                  margin: 0,
                  maxWidth: "900px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #27272a",
              paddingTop: "24px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: "#71717a",
              }}
            >
              System Architecture · Homelab · Infrastructure
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "#3b82f6",
                fontWeight: "500",
              }}
            >
              poctoprod.com
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const error = e as Error;
    return new Response(`Failed to generate image: ${error.message}`, {
      status: 500,
    });
  }
}

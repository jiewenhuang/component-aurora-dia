import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { auroraDiaStyle } from "./aurora-dia-style.ts";
import { AuroraDia as Dia, DiaConfig } from "./utils";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("aurora-dia")
export class AuroraDia extends LitElement {
  @property({ type: Boolean }) showDia = false;
  @property({ type: Dia }) dia: Dia = new Dia();

  // 位置
  @property({ type: String }) position = "left";
  // 语言
  @property({ type: String }) locale = "zh-CN";

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Object }) themeConfig = {
    dark_mode: "auto",
    profile_shape: "diamond",
    feature: true,
    gradient: {
      color_1: "#24c6dc",
      color_2: "#5433ff",
      color_3: "#ff0099",
    },
    header_gradient_css:
      "linear-gradient(130deg, #24c6dc, #5433ff 41.07%, #ff0099 76.05%)",
    background_gradient_style: {
      background:
        "linear-gradient(130deg, #24c6dc, #5433ff 41.07%, #ff0099 76.05%)",
      "-webkit-background-clip": "text",
      "-webkit-text-fill-color": "transparent",
      "-webkit-box-decoration-break": "clone",
      "box-decoration-break": "clone",
    },
  };
  currentColorScheme: "light" | "dark" = "light";

  // Querying DOM elements using Lit's @query decorator
  private leftEyeEl: HTMLElement | null | undefined = null;
  private rightEyeEl: HTMLElement | null | undefined = null;
  private eyesEl: HTMLElement | null | undefined = null;
  private eyesAnimationTimer: number | undefined = undefined;
  firstUpdated() {
    this.initializeBot();
    // 在组件第一次更新后，获取眼睛的 DOM 元素
    this.leftEyeEl = this.shadowRoot?.querySelector("#Aurora-Dia--left-eye");
    this.rightEyeEl = this.shadowRoot?.querySelector("#Aurora-Dia--right-eye");
    this.eyesEl = this.shadowRoot?.querySelector("#Aurora-Dia--eyes");

    if (this.leftEyeEl && this.rightEyeEl && this.eyesEl) {
      this.activateMotion();
    }
  }
  activateMotion(): void {
    let requestID: number | null = null;
    let lastX = 0;
    let lastY = 0;

    // 使用 mousemove 监听器来更新眼睛位置
    document.addEventListener("mousemove", (evt: MouseEvent) => {
      if (this.leftEyeEl && this.rightEyeEl && this.eyesEl) {
        if (requestID) cancelAnimationFrame(requestID);

        requestID = requestAnimationFrame(() => {
          const x =
            -(this.eyesEl!.getBoundingClientRect().left - evt.clientX) / 100;
          const y =
            -(this.eyesEl!.getBoundingClientRect().top - evt.clientY) / 120;

          if (x !== lastX || y !== lastY) {
            this.leftEyeEl!.style.transform = `translateY(${y}px) translateX(${x}px)`;
            this.rightEyeEl!.style.transform = `translateY(${y}px) translateX(${x}px)`;
            lastX = x;
            lastY = y;
          }

          // 重置动画效果
          clearTimeout(this.eyesAnimationTimer);
          this.eyesEl!.classList.add("moving");
          this.eyesAnimationTimer = setTimeout(() => {
            this.leftEyeEl!.style.transform = `translateY(0) translateX(0)`;
            this.rightEyeEl!.style.transform = `translateY(0) translateX(0)`;
            this.eyesEl!.classList.remove("moving");
          }, 2000);
        });
      }
    });
  }
  updated(
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ) {
    super.updated(changedProperties);
    if (changedProperties.has("themeConfig")) {
      this.initializeBot();
    }
  }
  initStore(configs: DiaConfig) {
    this.dia.installSoftware(configs);
    this.dia.on();
  }

  initializeBot() {
    this.initStore({
      locale: this.locale,
    });
    setTimeout(() => {
      this.showDia = true;
    }, 1000);
  }
  detectColorScheme() {
    // 检测用户的颜色模式（暗色模式或亮色模式）
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.currentColorScheme = darkModeQuery.matches ? "dark" : "light";

    // 监听颜色模式变化
    darkModeQuery.addEventListener("change", (e) => {
      this.currentColorScheme = e.matches ? "dark" : "light";
      this.requestUpdate(); // 请求重新渲染
    });
  }

  // 动态计算 CSS 变量
  get cssVariables() {
    return {
      "--aurora-dia--linear-gradient":
        this.themeConfig?.header_gradient_css || "",
      "--aurora-dia--linear-gradient-hover": `linear-gradient(to bottom, ${this.themeConfig?.gradient?.color_2}, ${this.themeConfig?.gradient?.color_3})`,
      "--aurora-dia--platform-light": this.themeConfig?.gradient?.color_3 || "",
      "--text-normal":
        this.currentColorScheme === "dark" ? "#bebebe" : "#333333", // 使用 currentColorScheme
      "--text-accent":
        this.currentColorScheme === "dark" ? "#0fb6d6" : "#e93796", // 使用 currentColorScheme
      "--text-sub-accent":
        this.currentColorScheme === "dark" ? "#f4569d" : "#547ce7", // 使用 currentColorScheme
      "--background-secondary":
        this.currentColorScheme === "dark" ? "#212121" : "#ffffff", // 使用 currentColorScheme
    };
  }

  render() {
    return html`
      <div
        id="bot-container"
        style="${this.position === "left" ? "left: 20px;" : "right:20px;"}"
      >
        <div id="Aurora-Dia--body" style="${this.computeCssVariables}">
          <div
            id="Aurora-Dia--tips-wrapper"
            style="${this.position === "left"
              ? "right: -120px;"
              : "left: -120px;"}"
          >
            <div id="Aurora-Dia--tips" class="Aurora-Dia--tips">早上好呀～</div>
          </div>
          <div id="Aurora-Dia" class="Aurora-Dia">
            <div id="Aurora-Dia--eyes" class="Aurora-Dia--eyes">
              <div id="Aurora-Dia--left-eye" class="Aurora-Dia--eye left"></div>
              <div
                id="Aurora-Dia--right-eye"
                class="Aurora-Dia--eye right"
              ></div>
            </div>
          </div>
          <div class="Aurora-Dia--platform"></div>
        </div>
      </div>
    `;
  }
  // 计算内联的 CSS 变量
  get computeCssVariables() {
    return `
      --aurora-dia--linear-gradient: ${this.cssVariables["--aurora-dia--linear-gradient"]};
      --aurora-dia--linear-gradient-hover: ${this.cssVariables["--aurora-dia--linear-gradient-hover"]};
      --aurora-dia--platform-light: ${this.cssVariables["--aurora-dia--platform-light"]};
        --text-normal: ${this.cssVariables["--text-normal"]};
        --text-accent: ${this.cssVariables["--text-accent"]};
        --text-sub-accent: ${this.cssVariables["--text-sub-accent"]};
        --background-secondary: ${this.cssVariables["--background-secondary"]};
        
    `;
  }
  static styles = [auroraDiaStyle, css``];
}
customElements.get("aurora-dia") ||
  customElements.define("aurora-dia", AuroraDia);
declare global {
  interface HTMLElementTagNameMap {
    "aurora-dia": AuroraDia;
  }
}

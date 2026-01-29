/*
*   Stripe WebGl Gradient Animation
*   All Credits to Stripe.com
*   https://kevinhufnagl.com
*/

// Converting colors to proper format
function normalizeColor(hexCode: number): number[] {
  return [(hexCode >> 16 & 255) / 255, (hexCode >> 8 & 255) / 255, (255 & hexCode) / 255]
}

// Essential functionality of WebGl
class MiniGl {
  canvas!: HTMLCanvasElement;
  gl!: WebGLRenderingContext;
  meshes!: any[];
  lastDebugMsg!: number;
  debug!: (...args: any[]) => void;
  commonUniforms!: any;
  width!: number;
  height!: number;
  Material!: any;
  Uniform!: any;
  PlaneGeometry!: any;
  Mesh!: any;
  Attribute!: any;

  constructor(canvas: HTMLCanvasElement, width: number | null, height: number | null, debug = false) {
    const _miniGl = this;
    const debug_output = -1 !== document.location.search.toLowerCase().indexOf("debug=webgl");
    _miniGl.canvas = canvas;
    _miniGl.gl = _miniGl.canvas.getContext("webgl", { antialias: true })!;
    _miniGl.meshes = [];
    const context = _miniGl.gl;
    
    if (width && height) this.setSize(width, height);
    
    _miniGl.lastDebugMsg = 0;
    _miniGl.debug = debug && debug_output ? function(e: string) {
      const t = Date.now();
      if (t - _miniGl.lastDebugMsg > 1e3) console.log("---");
      console.log(new Date(t).toLocaleTimeString() + Array(Math.max(0, 32 - e.length)).join(" ") + e + ": ", ...Array.from(arguments).slice(1));
      _miniGl.lastDebugMsg = t;
    } : () => {};

    Object.defineProperties(_miniGl, {
      Material: {
        enumerable: false,
        value: class {
          uniforms: any;
          uniformInstances!: any[];
          vertexSource!: string;
          Source!: string;
          vertexShader!: WebGLShader;
          fragmentShader!: WebGLShader;
          program!: WebGLProgram;

          constructor(vertexShaders: string, fragments: string, uniforms: any = {}) {
            const material = this;
            
            function getShaderByType(type: number, source: string): WebGLShader {
              const shader = context.createShader(type)!;
              context.shaderSource(shader, source);
              context.compileShader(shader);
              if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
                console.error(context.getShaderInfoLog(shader));
              }
              _miniGl.debug("Material.compileShaderSource", { source });
              return shader;
            }

            function getUniformVariableDeclarations(uniforms: any, type: string): string {
              return Object.entries(uniforms).map(([uniform, value]: [string, any]) => value.getDeclaration(uniform, type)).join("\n");
            }

            material.uniforms = uniforms;
            material.uniformInstances = [];

            const prefix = "\n              precision highp float;\n            ";
            material.vertexSource = `
              ${prefix}
              attribute vec4 position;
              attribute vec2 uv;
              attribute vec2 uvNorm;
              ${getUniformVariableDeclarations(_miniGl.commonUniforms, "vertex")}
              ${getUniformVariableDeclarations(uniforms, "vertex")}
              ${vertexShaders}
            `;
            material.Source = `
              ${prefix}
              ${getUniformVariableDeclarations(_miniGl.commonUniforms, "fragment")}
              ${getUniformVariableDeclarations(uniforms, "fragment")}
              ${fragments}
            `;
            material.vertexShader = getShaderByType(context.VERTEX_SHADER, material.vertexSource);
            material.fragmentShader = getShaderByType(context.FRAGMENT_SHADER, material.Source);
            material.program = context.createProgram()!;
            context.attachShader(material.program, material.vertexShader);
            context.attachShader(material.program, material.fragmentShader);
            context.linkProgram(material.program);
            if (!context.getProgramParameter(material.program, context.LINK_STATUS)) {
              console.error(context.getProgramInfoLog(material.program));
            }
            context.useProgram(material.program);
            material.attachUniforms(undefined, _miniGl.commonUniforms);
            material.attachUniforms(undefined, material.uniforms);
          }

          attachUniforms(name: string | undefined, uniforms: any) {
            const material = this;
            if (name === undefined) {
              Object.entries(uniforms).forEach(([name, uniform]) => {
                material.attachUniforms(name, uniform);
              });
            } else if (uniforms.type === "array") {
              uniforms.value.forEach((uniform: any, i: number) => material.attachUniforms(`${name}[${i}]`, uniform));
            } else if (uniforms.type === "struct") {
              Object.entries(uniforms.value).forEach(([uniform, i]) => material.attachUniforms(`${name}.${uniform}`, i));
            } else {
              _miniGl.debug("Material.attachUniforms", { name, uniform: uniforms });
              material.uniformInstances.push({
                uniform: uniforms,
                location: context.getUniformLocation(material.program, name)
              });
            }
          }
        }
      },
      Uniform: {
        enumerable: false,
        value: class {
          type: string = "float";
          value: any;
          typeFn!: string;
          transpose!: boolean;
          excludeFrom: string | undefined;

          constructor(e: any) {
            Object.assign(this, e);
            this.typeFn = ({
              float: "1f",
              int: "1i",
              vec2: "2fv",
              vec3: "3fv",
              vec4: "4fv",
              mat4: "Matrix4fv"
            } as any)[this.type] || "1f";
            this.update();
          }

          update(value?: WebGLUniformLocation) {
            if (this.value !== undefined) {
              (context as any)[`uniform${this.typeFn}`](value, this.typeFn.indexOf("Matrix") === 0 ? this.transpose : this.value, this.typeFn.indexOf("Matrix") === 0 ? this.value : null);
            }
          }

          getDeclaration(name: string, type: string, length?: number): string {
            const uniform = this;
            if (uniform.excludeFrom !== type) {
              if (uniform.type === "array") {
                return uniform.value[0].getDeclaration(name, type, uniform.value.length) + `\nconst int ${name}_length = ${uniform.value.length};`;
              }
              if (uniform.type === "struct") {
                let name_no_prefix = name.replace("u_", "");
                name_no_prefix = name_no_prefix.charAt(0).toUpperCase() + name_no_prefix.slice(1);
                return `uniform struct ${name_no_prefix} 
                {\n` +
                  Object.entries(uniform.value).map(([name, uniform]: [string, any]) =>
                    uniform.getDeclaration(name, type).replace(/^uniform/, "")
                  ).join("") +
                  `\n} ${name}${length && length > 0 ? `[${length}]` : ""};`;
              }
              return `uniform ${uniform.type} ${name}${length && length > 0 ? `[${length}]` : ""};`;
            }
            return "";
          }
        }
      },
      PlaneGeometry: {
        enumerable: false,
        value: class {
          attributes: any;
          xSegCount!: number;
          ySegCount!: number;
          vertexCount!: number;
          quadCount!: number;
          width!: number;
          height!: number;
          orientation!: string;

          constructor(width?: number, height?: number, n?: number, i?: number, orientation?: string) {
            context.createBuffer();
            this.attributes = {
              position: new _miniGl.Attribute({ target: context.ARRAY_BUFFER, size: 3 }),
              uv: new _miniGl.Attribute({ target: context.ARRAY_BUFFER, size: 2 }),
              uvNorm: new _miniGl.Attribute({ target: context.ARRAY_BUFFER, size: 2 }),
              index: new _miniGl.Attribute({ target: context.ELEMENT_ARRAY_BUFFER, size: 3, type: context.UNSIGNED_SHORT })
            };
            this.setTopology(n, i);
            this.setSize(width, height, orientation);
          }

          setTopology(e = 1, t = 1) {
            const n = this;
            n.xSegCount = e;
            n.ySegCount = t;
            n.vertexCount = (n.xSegCount + 1) * (n.ySegCount + 1);
            n.quadCount = n.xSegCount * n.ySegCount * 2;
            n.attributes.uv.values = new Float32Array(2 * n.vertexCount);
            n.attributes.uvNorm.values = new Float32Array(2 * n.vertexCount);
            n.attributes.index.values = new Uint16Array(3 * n.quadCount);
            
            for (let e = 0; e <= n.ySegCount; e++) {
              for (let t = 0; t <= n.xSegCount; t++) {
                const i = e * (n.xSegCount + 1) + t;
                n.attributes.uv.values[2 * i] = t / n.xSegCount;
                n.attributes.uv.values[2 * i + 1] = 1 - e / n.ySegCount;
                n.attributes.uvNorm.values[2 * i] = t / n.xSegCount * 2 - 1;
                n.attributes.uvNorm.values[2 * i + 1] = 1 - e / n.ySegCount * 2;
                
                if (t < n.xSegCount && e < n.ySegCount) {
                  const s = e * n.xSegCount + t;
                  n.attributes.index.values[6 * s] = i;
                  n.attributes.index.values[6 * s + 1] = i + 1 + n.xSegCount;
                  n.attributes.index.values[6 * s + 2] = i + 1;
                  n.attributes.index.values[6 * s + 3] = i + 1;
                  n.attributes.index.values[6 * s + 4] = i + 1 + n.xSegCount;
                  n.attributes.index.values[6 * s + 5] = i + 2 + n.xSegCount;
                }
              }
            }
            n.attributes.uv.update();
            n.attributes.uvNorm.update();
            n.attributes.index.update();
            _miniGl.debug("Geometry.setTopology", { uv: n.attributes.uv, uvNorm: n.attributes.uvNorm, index: n.attributes.index });
          }

          setSize(width = 1, height = 1, orientation = "xz") {
            const geometry = this;
            geometry.width = width;
            geometry.height = height;
            geometry.orientation = orientation;
            
            if (!geometry.attributes.position.values || geometry.attributes.position.values.length !== 3 * geometry.vertexCount) {
              geometry.attributes.position.values = new Float32Array(3 * geometry.vertexCount);
            }
            
            const o = width / -2;
            const r = height / -2;
            const segment_width = width / geometry.xSegCount;
            const segment_height = height / geometry.ySegCount;
            
            for (let yIndex = 0; yIndex <= geometry.ySegCount; yIndex++) {
              const t = r + yIndex * segment_height;
              for (let xIndex = 0; xIndex <= geometry.xSegCount; xIndex++) {
                const rx = o + xIndex * segment_width;
                const l = yIndex * (geometry.xSegCount + 1) + xIndex;
                geometry.attributes.position.values[3 * l + "xyz".indexOf(orientation[0])] = rx;
                geometry.attributes.position.values[3 * l + "xyz".indexOf(orientation[1])] = -t;
              }
            }
            geometry.attributes.position.update();
            _miniGl.debug("Geometry.setSize", { position: geometry.attributes.position });
          }
        }
      },
      Mesh: {
        enumerable: false,
        value: class {
          geometry: any;
          material: any;
          wireframe!: boolean;
          attributeInstances!: any[];

          constructor(geometry: any, material: any) {
            const mesh = this;
            mesh.geometry = geometry;
            mesh.material = material;
            mesh.wireframe = false;
            mesh.attributeInstances = [];
            Object.entries(mesh.geometry.attributes).forEach(([e, attribute]: [string, any]) => {
              mesh.attributeInstances.push({
                attribute: attribute,
                location: attribute.attach(e, mesh.material.program)
              });
            });
            _miniGl.meshes.push(mesh);
            _miniGl.debug("Mesh.constructor", { mesh });
          }

          draw() {
            context.useProgram(this.material.program);
            this.material.uniformInstances.forEach(({ uniform: e, location: t }: any) => e.update(t));
            this.attributeInstances.forEach(({ attribute: e, location: t }: any) => e.use(t));
            context.drawElements(this.wireframe ? context.LINES : context.TRIANGLES, this.geometry.attributes.index.values.length, context.UNSIGNED_SHORT, 0);
          }

          remove() {
            _miniGl.meshes = _miniGl.meshes.filter((e: any) => e != this);
          }
        }
      },
      Attribute: {
        enumerable: false,
        value: class {
          type: number = context.FLOAT;
          normalized: boolean = false;
          buffer: WebGLBuffer;
          target!: number;
          size!: number;
          values!: Float32Array | Uint16Array;

          constructor(e: any) {
            this.buffer = context.createBuffer()!;
            Object.assign(this, e);
            this.update();
          }

          update() {
            if (this.values !== undefined) {
              context.bindBuffer(this.target, this.buffer);
              context.bufferData(this.target, this.values, context.STATIC_DRAW);
            }
          }

          attach(e: string, t: WebGLProgram): number {
            const n = context.getAttribLocation(t, e);
            if (this.target === context.ARRAY_BUFFER) {
              context.enableVertexAttribArray(n);
              context.vertexAttribPointer(n, this.size, this.type, this.normalized, 0, 0);
            }
            return n;
          }

          use(e: number) {
            context.bindBuffer(this.target, this.buffer);
            if (this.target === context.ARRAY_BUFFER) {
              context.enableVertexAttribArray(e);
              context.vertexAttribPointer(e, this.size, this.type, this.normalized, 0, 0);
            }
          }
        }
      }
    });

    const a = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    _miniGl.commonUniforms = {
      projectionMatrix: new _miniGl.Uniform({ type: "mat4", value: a }),
      modelViewMatrix: new _miniGl.Uniform({ type: "mat4", value: a }),
      resolution: new _miniGl.Uniform({ type: "vec2", value: [1, 1] }),
      aspectRatio: new _miniGl.Uniform({ type: "float", value: 1 })
    };
  }

  setSize(e = 640, t = 480) {
    this.width = e;
    this.height = t;
    this.canvas.width = e;
    this.canvas.height = t;
    this.gl.viewport(0, 0, e, t);
    this.commonUniforms.resolution.value = [e, t];
    this.commonUniforms.aspectRatio.value = e / t;
    this.debug("MiniGL.setSize", { width: e, height: t });
  }

  setOrthographicCamera(e = 0, t = 0, n = 0, i = -2e3, s = 2e3) {
    this.commonUniforms.projectionMatrix.value = [2 / this.width, 0, 0, 0, 0, 2 / this.height, 0, 0, 0, 0, 2 / (i - s), 0, e, t, n, 1];
    this.debug("setOrthographicCamera", this.commonUniforms.projectionMatrix.value);
  }

  render() {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clearDepth(1);
    this.meshes.forEach((e: any) => e.draw());
  }
}

// Gradient object
export class Gradient {
  el: HTMLCanvasElement | null = null;
  cssVarRetries = 0;
  maxCssVarRetries = 200;
  angle = 0;
  isLoadedClass = false;
  isScrolling = false;
  scrollingTimeout: number | undefined;
  scrollingRefreshDelay = 200;
  isIntersecting = false;
  shaderFiles: any;
  vertexShader: string = '';
  sectionColors: number[][] = [];
  computedCanvasStyle: CSSStyleDeclaration | null = null;
  conf: any;
  uniforms: any;
  t = 1253106;
  last = 0;
  width = 0;
  minWidth = 1111;
  height = 600;
  xSegCount = 0;
  ySegCount = 0;
  mesh: any;
  material: any;
  geometry: any;
  minigl: MiniGl | null = null;
  scrollObserver: any;
  amp = 320;
  seed = 5;
  freqX = 14e-5;
  freqY = 29e-5;
  freqDelta = 1e-5;
  activeColors = [1, 1, 1, 1];
  isMetaKey = false;
  isGradientLegendVisible = false;
  isMouseDown = false;
  isStatic = false;

  handleScroll = () => {
    clearTimeout(this.scrollingTimeout);
    this.scrollingTimeout = window.setTimeout(this.handleScrollEnd, this.scrollingRefreshDelay);
    if (this.isGradientLegendVisible) this.hideGradientLegend();
    if (this.conf.playing) {
      this.isScrolling = true;
      this.pause();
    }
  };

  handleScrollEnd = () => {
    this.isScrolling = false;
    if (this.isIntersecting) this.play();
  };

  resize = () => {
    if (!this.el || !this.minigl || !this.mesh) return;
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
    this.minigl.setSize(this.width, this.height);
    this.minigl.setOrthographicCamera();
    this.xSegCount = Math.ceil(this.width * this.conf.density[0]);
    this.ySegCount = Math.ceil(this.height * this.conf.density[1]);
    this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount);
    this.mesh.geometry.setSize(this.width, this.height);
    this.mesh.material.uniforms.u_shadow_power.value = this.width < 600 ? 5 : 6;
  };

  handleMouseDown = (e: MouseEvent) => {
    if (this.isGradientLegendVisible) {
      this.isMetaKey = e.metaKey;
      this.isMouseDown = true;
      if (!this.conf.playing) requestAnimationFrame(this.animate);
    }
  };

  handleMouseUp = () => {
    this.isMouseDown = false;
  };

  animate = (e: number) => {
    if (!this.shouldSkipFrame(e) || this.isMouseDown) {
      this.t += Math.min(e - this.last, 1e3 / 15);
      this.last = e;
      if (this.isMouseDown) {
        let delta = 160;
        if (this.isMetaKey) delta = -160;
        this.t += delta;
      }
      this.mesh.material.uniforms.u_time.value = this.t;
      this.minigl!.render();
    }
    if (this.last !== 0 && this.isStatic) {
      this.minigl!.render();
      this.disconnect();
      return;
    }
    if (this.conf.playing || this.isMouseDown) {
      requestAnimationFrame(this.animate);
    }
  };

  addIsLoadedClass = () => {
    if (!this.isLoadedClass && this.el) {
      this.isLoadedClass = true;
      this.el.classList.add("isLoaded");
      setTimeout(() => {
        this.el?.parentElement?.classList.add("isLoaded");
      }, 3e3);
    }
  };

  pause = () => {
    this.conf.playing = false;
  };

  play = () => {
    requestAnimationFrame(this.animate);
    this.conf.playing = true;
  };

  initGradient = (selector: string) => {
    this.el = document.querySelector(selector);
    if (this.el) this.connect();
    return this;
  };

  connect() {
    this.shaderFiles = {
      vertex: `varying vec3 v_color;

void main() {
  float time = u_time * u_global.noiseSpeed;

  vec2 noiseCoord = resolution * uvNorm * u_global.noiseFreq;

  vec2 st = 1. - uvNorm.xy;

  // Front-to-back tilt
  float tilt = resolution.y / 2.0 * uvNorm.y;

  // Left-to-right angle
  float incline = resolution.x * uvNorm.x / 2.0 * u_vertDeform.incline;

  // Up-down shift to offset incline
  float offset = resolution.x / 2.0 * u_vertDeform.incline * mix(u_vertDeform.offsetBottom, u_vertDeform.offsetTop, uv.y);

  // Vertex noise
  float noise = snoise(vec3(
    noiseCoord.x * u_vertDeform.noiseFreq.x + time * u_vertDeform.noiseFlow,
    noiseCoord.y * u_vertDeform.noiseFreq.y,
    time * u_vertDeform.noiseSpeed + u_vertDeform.noiseSeed
  )) * u_vertDeform.noiseAmp;

  // Fade noise to zero at edges
  noise *= 1.0 - pow(abs(uvNorm.y), 2.0);

  // Clamp to 0
  noise = max(0.0, noise);

  vec3 pos = vec3(
    position.x,
    position.y + tilt + incline + noise - offset,
    position.z
  );

  // Vertex color
  if (u_active_colors[0] == 1.) {
    v_color = u_baseColor;
  }

  for (int i = 0; i < u_waveLayers_length; i++) {
    if (u_active_colors[i + 1] == 1.) {
      WaveLayers layer = u_waveLayers[i];

      float noise = smoothstep(
        layer.noiseFloor,
        layer.noiseCeil,
        snoise(vec3(
          noiseCoord.x * layer.noiseFreq.x + time * layer.noiseFlow,
          noiseCoord.y * layer.noiseFreq.y,
          time * layer.noiseSpeed + layer.noiseSeed
        )) / 2.0 + 0.5
      );

      v_color = blendNormal(v_color, layer.color, pow(noise, 4.));
    }
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`,
      noise: `vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}`,
      blend: `vec3 blendNormal(vec3 base, vec3 blend) {
  return blend;
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
  return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
}`,
      fragment: `varying vec3 v_color;

void main() {
  vec3 color = v_color;
  if (u_darken_top == 1.0) {
    vec2 st = gl_FragCoord.xy/resolution.xy;
    color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;
  }
  gl_FragColor = vec4(color, 1.0);
}`
    };

    this.conf = {
      presetName: "",
      wireframe: false,
      density: [.06, .16],
      zoom: 1,
      rotation: 0,
      playing: true
    };

    if (!this.el) {
      console.log("DID NOT LOAD HERO STRIPE CANVAS");
      return;
    }

    this.minigl = new MiniGl(this.el, null, null, true);
    requestAnimationFrame(() => {
      if (this.el) {
        this.computedCanvasStyle = getComputedStyle(this.el);
        this.waitForCssVars();
      }
    });
  }

  disconnect() {
    window.removeEventListener("resize", this.resize);
  }

  initMaterial() {
    this.uniforms = {
      u_time: new this.minigl!.Uniform({ value: 0 }),
      u_shadow_power: new this.minigl!.Uniform({ value: 5 }),
      u_darken_top: new this.minigl!.Uniform({ value: this.el?.dataset.jsDarkenTop === "" ? 1 : 0 }),
      u_active_colors: new this.minigl!.Uniform({ value: this.activeColors, type: "vec4" }),
      u_global: new this.minigl!.Uniform({
        value: {
          noiseFreq: new this.minigl!.Uniform({ value: [this.freqX, this.freqY], type: "vec2" }),
          noiseSpeed: new this.minigl!.Uniform({ value: 5e-6 })
        },
        type: "struct"
      }),
      u_vertDeform: new this.minigl!.Uniform({
        value: {
          incline: new this.minigl!.Uniform({ value: Math.sin(this.angle) / Math.cos(this.angle) }),
          offsetTop: new this.minigl!.Uniform({ value: -.5 }),
          offsetBottom: new this.minigl!.Uniform({ value: -.5 }),
          noiseFreq: new this.minigl!.Uniform({ value: [3, 4], type: "vec2" }),
          noiseAmp: new this.minigl!.Uniform({ value: this.amp }),
          noiseSpeed: new this.minigl!.Uniform({ value: 10 }),
          noiseFlow: new this.minigl!.Uniform({ value: 3 }),
          noiseSeed: new this.minigl!.Uniform({ value: this.seed })
        },
        type: "struct",
        excludeFrom: "fragment"
      }),
      u_baseColor: new this.minigl!.Uniform({
        value: this.sectionColors[0],
        type: "vec3",
        excludeFrom: "fragment"
      }),
      u_waveLayers: new this.minigl!.Uniform({
        value: [],
        excludeFrom: "fragment",
        type: "array"
      })
    };

    for (let e = 1; e < this.sectionColors.length; e += 1) {
      this.uniforms.u_waveLayers.value.push(new this.minigl!.Uniform({
        value: {
          color: new this.minigl!.Uniform({ value: this.sectionColors[e], type: "vec3" }),
          noiseFreq: new this.minigl!.Uniform({ value: [2 + e / this.sectionColors.length, 3 + e / this.sectionColors.length], type: "vec2" }),
          noiseSpeed: new this.minigl!.Uniform({ value: 11 + .3 * e }),
          noiseFlow: new this.minigl!.Uniform({ value: 6.5 + .3 * e }),
          noiseSeed: new this.minigl!.Uniform({ value: this.seed + 10 * e }),
          noiseFloor: new this.minigl!.Uniform({ value: .1 }),
          noiseCeil: new this.minigl!.Uniform({ value: .63 + .07 * e })
        },
        type: "struct"
      }));
    }

    this.vertexShader = [this.shaderFiles.noise, this.shaderFiles.blend, this.shaderFiles.vertex].join("\n\n");
    return new this.minigl!.Material(this.vertexShader, this.shaderFiles.fragment, this.uniforms);
  }

  initMesh() {
    this.material = this.initMaterial();
    this.geometry = new this.minigl!.PlaneGeometry();
    this.mesh = new this.minigl!.Mesh(this.geometry, this.material);
  }

  shouldSkipFrame(e: number) {
    return !!window.document.hidden || (!this.conf.playing || (parseInt(String(e), 10) % 2 === 0 || undefined));
  }

  updateFrequency(e: number) {
    this.freqX += e;
    this.freqY += e;
  }

  toggleColor(index: number) {
    this.activeColors[index] = this.activeColors[index] === 0 ? 1 : 0;
  }

  showGradientLegend() {
    if (this.width > this.minWidth) {
      this.isGradientLegendVisible = true;
      document.body.classList.add("isGradientLegendVisible");
    }
  }

  hideGradientLegend() {
    this.isGradientLegendVisible = false;
    document.body.classList.remove("isGradientLegendVisible");
  }

  init() {
    this.initGradientColors();
    this.initMesh();
    this.resize();
    requestAnimationFrame(this.animate);
    window.addEventListener("resize", this.resize);
  }

  waitForCssVars() {
    if (this.computedCanvasStyle && this.computedCanvasStyle.getPropertyValue("--gradient-color-1").indexOf("#") !== -1) {
      this.init();
      this.addIsLoadedClass();
    } else {
      this.cssVarRetries += 1;
      if (this.cssVarRetries > this.maxCssVarRetries) {
        this.sectionColors = [
          normalizeColor(0xff0000),
          normalizeColor(0xff0000),
          normalizeColor(0xff00ff),
          normalizeColor(0x00ff00)
        ];
        this.init();
        return;
      }
      requestAnimationFrame(() => this.waitForCssVars());
    }
  }

  initGradientColors() {
    this.sectionColors = ["--gradient-color-1", "--gradient-color-2", "--gradient-color-3", "--gradient-color-4"]
      .map(cssPropertyName => {
        let hex = this.computedCanvasStyle!.getPropertyValue(cssPropertyName).trim();
        if (hex.length === 4) {
          const hexTemp = hex.substr(1).split("").map(h => h + h).join("");
          hex = `#${hexTemp}`;
        }
        return hex ? `0x${hex.substr(1)}` : null;
      })
      .filter(Boolean)
      .map(hex => normalizeColor(parseInt(hex as string, 16)));
  }
}

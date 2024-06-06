async function fetchShaderSource(url) {
    const response = await fetch(url);
    return await response.text();
}

async function main() {
    const canvas = document.getElementById('bgCanvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error('WebGL 2 not supported');
        return;
    }

    const vertexShaderSource = `#version 300 es
    in vec4 a_position;
    out vec2 uv;

    void main() {
        uv = a_position.xy * 0.5 + 0.5;
        gl_Position = a_position;
    }`;

    const psrdnoiseSource = await fetchShaderSource('https://raw.githubusercontent.com/stegu/psrdnoise/main/src/psrdnoise2.glsl');
    const bounceSource = `float bounceIn(float t) {
        return t * t * (3.0 - 2.0 * t);
    }`;

    const fragmentShaderSource = `#version 300 es
    precision highp float;
    precision highp sampler2D;

    in vec2 uv;
    out vec4 out_color;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec4 u_mouse;
    uniform sampler2D u_textures[16];

    ${psrdnoiseSource}
    ${bounceSource}

    vec2 rot(vec2 v, float a) {
        return mat2x2(cos(a), -sin(a), sin(a), cos(a)) * v;
    }

    void main() {
        vec2 st = uv * vec2(u_resolution.x / u_resolution.y, 1.);
        float angle = -3.1415926535897932384626433832795 / 8. + u_time * 0.05;  // Slower rotation
        st = rot(st, angle);

        vec2 mouse = u_mouse.xy / u_resolution;
        vec2 gradient;
        float speedFactor = 1.5; // Moderate speed
        float n = psrdnoise(vec2(3.) * st, vec2(0.), speedFactor * u_time + mouse.y * 3.1415926535897932384626433832795, gradient);

        float lines = cos((st.x + n * 0.1 + mouse.x + 0.2) * 3.1415926535897932384626433832795);

        out_color = vec4(
            mix(
                //darkmode
                vec3(0.471, 0.522, 0.463), // Dark teal
                vec3(0.780, 0.459, 0.329), // Orange

                //lightmode
                // vec3(0.749, 0.847, 0.800), // Light teal
                // vec3(0.800, 0.439, 0.298), // Orange
                bounceIn(lines * 0.5 + 0.5)
            ), 
            1.
        );
    }`;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');

    function render(time) {
        time *= 0.001;  // convert to seconds

        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(timeLocation, time);

        // mouse uniform can be updated here
        gl.uniform4f(mouseLocation, 0, 0, 0, 0);  // Example value

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();

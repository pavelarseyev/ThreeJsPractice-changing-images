import * as THREE from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { TimelineMax } from "gsap/gsap-core";
import * as dat from 'dat.gui';

THREE.OrbitControls = OrbitControls;

export function functionName() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.classList.add("tempcanvas");

    function loadImages(paths, whenLoaded) {
        let images = [];

        paths.forEach(function (path) {
            let img = new Image;

            img.onload = function () {
                images.push(img);
                if (images.length === paths.length) {
                    whenLoaded(images)
                }
            };

            img.src = path;
        });
    }

    function fillUp(array, max) {

        let length = array.length;

        for(let i = 0; i < max - length; i++) {

            let randomItem = array[Math.floor(Math.random()*length)];
            array.push(randomItem);
        }

        return array;
    }

    function getArrayFromImage(img) {
        let imageCoords = [];
        let width = canvas.width = img.width/2;
        let height = canvas.height = img.height/2;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        let data = ctx.getImageData(0, 0, width, height).data;


        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let alpha = data[((width * y) + x) * 4 + 3];

                if (alpha > 0) {
                    let red = data[((width * y) + x) * 4];
                    let green = data[((width * y) + x) * 4 + 1];
                    let blue = data[((width * y) + x) * 4 + 2];
                    let rgba = `rgb(${red}, ${green}, ${blue})`;

                    imageCoords.push({
                        x: x - width / 2,
                        y: -y + height / 2,
                        color: rgba
                    });
                }
            }
        }

        return imageCoords;
    }


    let images = ["../images/bigdrop-logo.svg", "../images/icon-1.svg", "../images/icon-2.svg", "../images/icon3.svg"];


    loadImages(images, function (loadedImages) {

        let gallery = [];

        loadedImages.forEach(function(el) {
            gallery.push(getArrayFromImage(el));
        });

        let maxLength = Math.max(...gallery.map(el => {return el.length}));

        gallery.forEach(el => fillUp(el, maxLength));

        let camera;
        let controls;
        let scene;
        let renderer;
        let geometry;
        // const gui = new dat.GUI();

        let cameraCoords = {
            X: 0,
            Y: 20,
            Z: 150,
        };

        // gui.add(cameraCoords, "X", 0, 500);
        // gui.add(cameraCoords, "Y", 0, 500);
        // gui.add(cameraCoords, "Z", 0, 500);

        function init() {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xffffff);
            // scene.fog = new THREE.FogExp2( 0xcccccc, 0.005 );


            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);

            let container = document.querySelector(".container");
            container.appendChild(renderer.domElement);

            //Camera
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 3000);
            camera.position.set(cameraCoords.X, cameraCoords.Y, cameraCoords.Z);
            controls = new THREE.OrbitControls(camera, renderer.domElement);


            //Оси Координат
            /*let linesMaterial;
            let linesArr = [];


            for (let i = 0; i < 3; i++) {
                let geometry2 = new THREE.Geometry();

                geometry2.vertices.push(new THREE.Vector3(0, 0, 0));

                switch (i) {
                    case 0:
                        //X COORDINATE LINE RED
                        linesMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
                        geometry2.vertices.push(new THREE.Vector3(window.innerWidth, 0, 0));
                        break;
                    case 1:
                        //Y COORDINATE LINE GREEN
                        linesMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
                        geometry2.vertices.push(new THREE.Vector3(0, window.innerHeight, 0));
                        break;
                    case 2:
                        //Z COORDINATE LINE BLUE
                        linesMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
                        geometry2.vertices.push(new THREE.Vector3(0, 0, 1000));
                        break;
                }

                linesArr.push(new THREE.Line(geometry2, linesMaterial));
            }

            linesArr.forEach(line => {
                scene.add(line);
            });*/
            //Оси Координат


            //ЧТО ЕСТЬ НА СЦЕНЕ
            let texture = (new THREE.TextureLoader).load("../images/particle.png");
            let material = new THREE.PointsMaterial({
                size: 4,
                vertexColors: THREE.VertexColors,
                map: texture,
                alphaTest: 0.5
            });

            geometry = new THREE.Geometry();

            let z;

            // //ТОЧКИ
            gallery[0].forEach((el, index) => {
                z = Math.random() * 20 - 10;

                geometry.colors.push(new THREE.Color(el.color));
                geometry.vertices.push(new THREE.Vector3(el.x, el.y, z));
            });


            let pointCloud = new THREE.Points(geometry, material);
            scene.add(pointCloud);

            //конец сцены

            window.addEventListener("resize", onWindowResize, false);

        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        let i = 0;

        function animate() {
            i++;
            requestAnimationFrame(animate);

            geometry.vertices.forEach(function (particle, index) {
                let dX, dY, dZ;

                // dX = Math.sin(i/10 + (index/2)) * 2;
                dX = 0;
                dY = 0;
                // dY = 0;
                dZ = Math.sin(i / 10 + (index * 3)) / 6;
                // dZ = 0;

                particle.add(new THREE.Vector3(dX, dY, dZ));
            });

            geometry.verticesNeedUpdate = true;
            geometry.colorsNeedUpdate = true;

            render();
        }

        function render() {
            renderer.render(scene, camera);
        }

        init();
        animate();

        let current = 0;

        document.body.addEventListener("click", function() {

            current++;
            current = current % gallery.length;

            geometry.colors.forEach(function (color, index) {
                let tl2 = new TimelineMax();
                let newColor = new THREE.Color(gallery[current][index].color);

                tl2.to(color, Math.random() * 1, {
                    r: newColor.r,
                    g: newColor.g,
                    b: newColor.b
                });
            });

            setTimeout(function () {
                geometry.vertices.forEach(function (particle, index) {
                    let tl = new TimelineMax();

                    tl.to(particle, 1.5, {
                        x: gallery[current][index].x,
                        y: gallery[current][index].y
                    }).call(function() {

                    });
                });
            }, 100);
        });
    });

    // document.querySelector(".main").appendChild(canvas);
}
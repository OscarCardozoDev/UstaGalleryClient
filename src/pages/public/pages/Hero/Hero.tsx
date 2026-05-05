import useScreen from "../../../../utils/useScreen";
import Slider from "../../components/slider/Slider";
import styles from "./Hero.module.css";
import imageHero from "/public/evento_test.png";

interface HeroProps {
  widthHeader: number;
  heightHeader: number;
  heightCarrusel: number;
  widthCarrusel: number;
  positionYCarrusel: number;
}

export default function Hero({
  widthHeader,
  heightHeader,
  heightCarrusel,
  widthCarrusel,
  positionYCarrusel,
}: HeroProps) {
  const { width, height } = useScreen();
  const svgWidth = width / 2.5;
  {/* 
    Se resta el height de la pantalla con la posicion del carrusel para que el carrusel quede en un solo lugar 
    sin importar la aultura relativa de la pantalla. El 125 es la posicion en la que se encuentra el carrusel
    en relacion al svg.
  */}
  positionYCarrusel = 125 + (height - positionYCarrusel);
  {/* 
    Se dejo el 250 para que el espacio del carrusel sea un poco mayor, de esta manera el carrusel tapa el svg y
    no se ve desproporcionado cuando se reduce el ancho de la pantalla.
  */}
  widthCarrusel = widthCarrusel - 250;

  return (
    <div className={styles.heroContent}>
      {/* En "L ${width - widthHeader - 35} 80" se deja en y el valor de 80 porque el height del boton es de 40px mas 20 de margin */}
      <svg
        className={styles.svgBg}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <clipPath id="heroClip">
            <path
              d={`

                  M ${svgWidth} 25


                L ${width - (widthHeader + 50) - 20} 25
                A 20 20 0 0 1 ${width - (widthHeader + 50)} 45

                L ${width - (widthHeader + 50)} ${heightHeader - 20 + 10}
                A 20 20 0 0 0 ${width - (widthHeader + 50) + 20} ${
                  heightHeader + 10
                }

                L ${width - 25 - 20} ${heightHeader + 10}
                A 20 20 0 0 1 ${width - 25} ${heightHeader + 20 + 10}

                L ${width - 25} ${height - 25 - 20}
                A 20 20 0 0 1 ${width - 25 - 20} ${height - 25}

                L ${svgWidth + 20} ${height - 25}
                A 20 20 0 0 1 ${svgWidth} ${height - 20 - 20}

                L ${svgWidth} ${height - positionYCarrusel + 20}
                A 20 20 0 0 1 ${svgWidth + 20} ${height - positionYCarrusel}

                L ${svgWidth + widthCarrusel - 20} ${height - positionYCarrusel}
                A 20 20 0 0 0 ${svgWidth + widthCarrusel} ${
                  height - positionYCarrusel - 20
                }

                  L ${svgWidth + widthCarrusel} ${
                    height - positionYCarrusel - heightCarrusel + 20
                  }
                  A 20 20 0 0 0 ${svgWidth + widthCarrusel - 20} ${
                    height - positionYCarrusel - heightCarrusel
                  }

                  L ${svgWidth + 20} ${
                    height - positionYCarrusel - heightCarrusel
                  }
                  A 20 20 0 0 1 ${svgWidth} ${
                    height - positionYCarrusel - heightCarrusel - 20
                  }

                  L ${svgWidth} 45
                  A 20 20 0 0 1 ${svgWidth + 20} 25
    

                Z
              `}
            />
          </clipPath>

          <linearGradient
            id="myGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="gray" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
        </defs>

        {/* El gradiente va en el fondo y la imagen por encima dentro del mismo clipPath */}
        <g clipPath="url(#heroClip)">
          <rect width="100%" height="100%" fill="url(#myGradient)" />
          <image
            xlinkHref={imageHero}
            width="35%"
            height="100%"
            x="50%"
            y="5%"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </svg>

      <div
        className={styles.sliderContent}
        style={{
          height: heightCarrusel,
          right: svgWidth - 15,
          top: height - positionYCarrusel - heightCarrusel,
        }}
      >
        <Slider
          images={[
            "https://assets.codepen.io/222579/castell.jpg",
            "https://www.manualweb.net/img/logos/svg.png",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhesKKpZtpc22-MGtgjgH7tVgDcEPuZi6BgQ&s",
            "https://assets.codepen.io/222579/castell.jpg",
            "https://www.manualweb.net/img/logos/svg.png",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhesKKpZtpc22-MGtgjgH7tVgDcEPuZi6BgQ&s",
            "https://assets.codepen.io/222579/castell.jpg",
            "https://www.manualweb.net/img/logos/svg.png",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhesKKpZtpc22-MGtgjgH7tVgDcEPuZi6BgQ&s",
          ]}
        />
      </div>

      <div
        className={styles.textContent}
        style={{
          width: svgWidth,
        }}
      >
        <h1><p>Patrimonio, cultura y conocimiento</p><br /><span>Usta Gallery</span></h1>

        <p>
        Bienvenido a la Galería Virtual de la Universidad Santo Tomás, un espacio digital 
    diseñado para redescubrir nuestras expresiones artísticas y culturales desde una 
    perspectiva inmersiva y contemporánea. Aquí podrás recorrer obras, proyectos, 
    archivos y experiencias que reflejan la creatividad, la memoria institucional y 
    la identidad tomasina, todo dentro de un entorno interactivo que combina diseño, 
    tecnología y narrativa visual. Este es un lugar donde el arte trasciende la pantalla 
    y se convierte en una invitación para explorar, sentir y conectar con las historias 
    que dan vida a nuestra universidad.
        </p>
      </div>
    </div>
  );
}

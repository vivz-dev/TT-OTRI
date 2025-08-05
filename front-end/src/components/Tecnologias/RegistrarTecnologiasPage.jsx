import Header from './componentes/Header'
import Footer from './componentes/Footer'
import Scroll from './componentes/Scroll'


const RegistrarTecnologiasPage = ({ onBack }) => {
  return (
    <main className='page-container'>
      <Header onBack={onBack} />
      <Scroll/>
      <Footer/>
    </main>
  );
};

export default RegistrarTecnologiasPage;

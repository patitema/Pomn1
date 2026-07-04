import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user/model/selectors';
import { Footer } from '@widgets/footer';
import { routes } from '@shared/config';
import './HomePage.css';

const overviewItems = [
  {
    title: 'Заметки онлайн',
    text: 'Создавайте личные заметки, учебные материалы и рабочие записи в одном онлайн-сервисе. POMNI помогает быстро сохранить идею и вернуться к ней, когда она снова понадобится.',
  },
  {
    title: 'Папки и структура',
    text: 'Раскладывайте заметки по папкам, собирайте темы в понятную систему и держите важные материалы рядом. Это удобно для учебы, проектов, планов и личной базы знаний.',
  },
  {
    title: 'Граф знаний',
    text: 'Связывайте заметки между собой и смотрите, как идеи соединяются в граф знаний. Такой обзор помогает находить связи между конспектами, задачами и полезной информацией.',
  },
  {
    title: 'Задачи рядом с заметками',
    text: 'Ведите задачи, планируйте неделю и связывайте дела с нужными заметками. POMNI объединяет заметки и задачи, чтобы контекст не терялся при работе.',
  },
];

const useCases = [
  'конспекты и подготовка к учебе',
  'личные проекты и списки задач',
  'рабочие материалы и идеи',
  'простая база знаний без сложной настройки',
];

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const landingLink = isAuthenticated ? routes.notes : routes.auth;

  return (
    <div className="page-container">
      <div className="header-container">
        <h1>POMNI</h1>
        <p>Онлайн-сервис для заметок, задач, папок и связей между знаниями</p>
        <Link to={landingLink} className="home-cta home-cta--header">
          {isAuthenticated ? 'Перейти к заметкам' : 'Начать'}
        </Link>
      </div>

      <main>
        <section className="main-container" aria-labelledby="home-intro-title">
          <h2 id="home-intro-title">Заметки и задачи в одном месте</h2>
          <p className="home-lead">
            POMNI помогает хранить заметки онлайн, объединять их в папки, видеть связи в графе знаний
            и планировать задачи без переключения между разными инструментами.
          </p>
          <Link to={landingLink} className="home-cta home-cta--main">
            {isAuthenticated ? 'Перейти к заметкам' : 'Начать пользоваться'}
          </Link>
        </section>

        <section className="home-overview" aria-labelledby="home-overview-title">
          <div className="home-section-heading">
            <p>POMNI для повседневной работы</p>
            <h2 id="home-overview-title">Что можно делать на сайте</h2>
          </div>

          <div className="home-overview__grid">
            {overviewItems.map((item) => (
              <article className="home-overview__item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-use-cases" aria-labelledby="home-use-cases-title">
          <div>
            <p className="home-use-cases__eyebrow">Для чего подходит</p>
            <h2 id="home-use-cases-title">Личная база знаний без лишней сложности</h2>
            <p>
              Сервис подходит, если нужно быстро записывать мысли, вести список дел, хранить материалы
              по темам и находить нужные записи через структуру папок или связи между заметками.
            </p>
          </div>

          <ul className="home-use-cases__list">
            {useCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;

import { Footer } from '@widgets/footer';
import './HomePage.css';

const overviewItems = [
  {
    title: 'Заметки онлайн',
    href: '/notes-online',
    text: 'Создавайте личные заметки, рабочие материалы и быстрые идеи в одном онлайн-сервисе. POMNI помогает сохранить мысль и вернуться к ней без лишнего поиска.',
  },
  {
    title: 'Заметки и задачи',
    href: '/tasks-and-notes',
    text: 'Ведите задачи рядом с нужными заметками, чтобы план не отрывался от контекста. Так проще помнить, зачем появилась задача и где лежат материалы.',
  },
  {
    title: 'Планирование недели',
    href: '/weekly-planner',
    text: 'Раскладывайте дела по дням недели, переносите задачи и держите ближайший план перед глазами без отдельного календарного сервиса.',
  },
  {
    title: 'Граф знаний',
    href: '/knowledge-graph',
    text: 'Связывайте заметки между собой и смотрите, как идеи соединяются в граф знаний. Это помогает находить связи между конспектами, задачами и материалами.',
  },
  {
    title: 'Markdown-заметки',
    href: '/markdown-notes',
    text: 'Оформляйте записи списками, заголовками, ссылками и кодом. Markdown подходит для конспектов, рабочих заметок и личной базы знаний.',
  },
];

const useCases = [
  'конспекты и подготовка к учебе',
  'личные проекты и списки задач',
  'рабочие материалы и идеи',
  'простая база знаний без сложной настройки',
];

export const HomePageView = ({ headerCtaLabel, mainCtaLabel, renderCta }) => (
  <div className="page-container">
    <div className="header-container">
      <h1>POMNI</h1>
      <p>Онлайн-сервис для заметок, задач, папок и связей между знаниями</p>
      {renderCta('home-cta home-cta--header', headerCtaLabel)}
    </div>

    <main>
      <section className="main-container" aria-labelledby="home-intro-title">
        <h2 id="home-intro-title">Заметки и задачи в одном месте</h2>
        <p className="home-lead">
          POMNI помогает хранить заметки онлайн, объединять их в папки, видеть связи в графе знаний
          и планировать задачи без переключения между разными инструментами.
        </p>
        {renderCta('home-cta home-cta--main', mainCtaLabel)}
      </section>

      <section className="home-overview" aria-labelledby="home-overview-title">
        <div className="home-section-heading">
          <p>POMNI для повседневной работы</p>
          <h2 id="home-overview-title">Что можно делать на сайте</h2>
        </div>

        <div className="home-overview__grid">
          {overviewItems.map((item) => (
            <a className="home-overview__item" href={item.href} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="home-overview__link">Подробнее</span>
            </a>
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

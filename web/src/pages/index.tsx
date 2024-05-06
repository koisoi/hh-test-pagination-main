import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container, Pagination } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

const DATA_LIMIT = 20;
const PAGES_LIMIT = 10;

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TUsersResponse = {
  users: TUserItem[];
  count: number;
};

type TGetServerSideProps = TUsersResponse & {
  statusCode: number;
  page: number;
};

export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  if (ctx.query.page && Number(ctx.query.page) < 1) {
    ctx.res.writeHead(308, { Location: "/" });
    ctx.res.end();
  }

  const page = Number(ctx.query.page || 1);
  try {
    const res = await fetch(`http://localhost:3000/users?limit=${DATA_LIMIT}&page=${page}`, {
      method: "GET",
    });
    if (!res.ok) {
      return { props: { statusCode: res.status, users: [], count: 0, page } };
    }

    const json: TUsersResponse = await res.json();
    return {
      props: { statusCode: 200, users: json.users, count: json.count, page },
    };
  } catch (e) {
    return { props: { statusCode: 500, users: [], count: 0, page } };
  }
}) satisfies GetServerSideProps<TGetServerSideProps>;

export default function Home({ statusCode, users, count, page }: TGetServerSideProps) {
  if (statusCode !== 200) {
    return <Alert variant={"danger"}>Ошибка {statusCode} при загрузке данных</Alert>;
  }

  const pages = [];
  const maxPages = Math.ceil(count / DATA_LIMIT);
  const paginationStart = Math.trunc((page - 1) / PAGES_LIMIT) * PAGES_LIMIT + 1;
  const paginationStop = paginationStart + PAGES_LIMIT - 1;

  for (let i = paginationStart; i <= (paginationStop <= maxPages ? paginationStop : maxPages); i++) {
    pages.push(
      <Pagination.Item key={i} active={i === page} href={`?page=${i}`}>
        {i}
      </Pagination.Item>
    );
  }

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={"mb-5"}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination>
            <Pagination.First disabled={page === 1} href="/" />
            <Pagination.Prev disabled={page === 1} href={`?page=${page - 1}`} />

            {pages}

            <Pagination.Next disabled={page === maxPages} href={`?page=${page + 1}`} />
            <Pagination.Last disabled={page === maxPages} href={`?page=${maxPages}`} />
          </Pagination>
        </Container>
      </main>
    </>
  );
}

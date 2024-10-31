import { EmojiFrown } from 'react-bootstrap-icons';

const NotFound = () => {
  return (
    <>
      <main className="d-flex vh-100 vw-100 text-center justify-content-center align-items-center">
        <h1>
          <EmojiFrown /> Page not found
        </h1>
      </main>
    </>
  );
};

export default NotFound;

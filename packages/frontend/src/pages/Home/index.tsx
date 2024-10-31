import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { Button, Col, Container, FloatingLabel, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Vqr from '../../components/Vqr';
import { useLocalStorage } from '../../hooks';
import './Home.scss';

const Home = () => {
  const navigate = useNavigate();

  const [queryId, setQueryId] = useLocalStorage('queryId', '');
  const [clientId, setClientId] = useLocalStorage('clientId', 'basic');
  const [owner, setOwner] = useLocalStorage('owner', '');
  const [app, setApp] = useLocalStorage('app', '');
  const [refreshKey, setRefreshKey] = useState(0);
  // const [sessionId, setSessionId] = useState('');
  // const [data, setData] = useState<any>();

  const vqlQueryId = useMemo(() => {
    return encodeURIComponent(`${queryId},${clientId}`);
  }, [queryId, clientId]);

  const onInit = (data: any) => {
    console.log('onInit', data);
  };
  const onScan = (data: any) => {
    // console.log('onScan', data);
    // if (data?.detail?.session_id) {
    //   setSessionId(data?.detail?.session_id);
    // }
    if (data?.detail?.session_id) {
      navigate('/result', { state: { sessionId: data?.detail?.session_id } });
    }
  };

  const onRefresh = () => {
    setRefreshKey(refreshKey + 1);
  };

  // const [stop] = usePolling(
  //   async () => {
  //     if (sessionId) {
  //       try {
  //         const payload = await dispatch(getSession({ sessionId })).unwrap();
  //         if (payload) {
  //           setData(payload);
  //         }
  //       } catch (error: any) {
  //         if (error?.name === 'NOT_FOUND') {
  //           // wait
  //         }
  //       }
  //     }
  //   },
  //   1500,
  //   [sessionId]
  // );

  // useEffect(() => {
  //   if (data) {
  //     stop();
  //     // TODO go to result page with data
  //   }
  // }, [data]);

  return (
    <>
      <main className="d-flex vh-100 vw-100 text-center justify-content-center align-items-center">
        <Container>
          <Row className="align-items-center g-lg-5 py-5">
            <Col lg={7} className="text-center text-lg-start">
              <h1 className="display-4 fw-bold lh-1 mb-3">Hello!</h1>
              <p className="col-lg-10 fs-4">
                Specify the following parameters to quickly generate a ShareRing Link QR code.
              </p>
              {queryId && clientId && owner && (
                <Vqr
                  key={refreshKey}
                  className="d-flex"
                  queryId={vqlQueryId}
                  qrcodeOwner={owner}
                  mode="dynamic"
                  app={!!app ? app : undefined}
                  onInit={onInit}
                  onScan={onScan}
                />
              )}
            </Col>
            <Col md={10} lg={5} className="mx-auto">
              <Form className={classNames('p-4 p-md-5 border rounded-3', 'bg-secondary')}>
                <FloatingLabel controlId="clientId" label="Client ID" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="basic"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="queryId" label="Query ID" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter query id"
                    value={queryId}
                    onChange={(e) => setQueryId(e.target.value)}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="owner" label="Owner address" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter owner address"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="app" label="Deeplink App" className="mb-3">
                  <Form.Select value={app} onChange={(e) => setApp(e.target.value)}>
                    <option value="">Default (ShareRing Pro)</option>
                    <option value="ShareRing Me">ShareRing Me</option>
                  </Form.Select>
                </FloatingLabel>
                <Button variant="primary" className="w-100" size="lg" onClick={onRefresh}>
                  Refresh
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Home;

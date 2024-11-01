import { useEffect, useState } from 'react';
import { Alert, Card, Container, Spinner, Table } from 'react-bootstrap';
import { CheckLg, XLg } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getSession, Session, VerificationLevel } from '../../components/Vqr/vqrSlice';
import { useAppDispatch, usePolling } from '../../hooks';

const Result = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const { state } = useLocation();
  // const sessionId = '92235de2-bd82-4a4b-a087-c11cde209ef2';
  const { sessionId } = useParams();
  if (!sessionId) {
    navigate('/');
  }

  const [data, setData] = useState<Session>();

  const [stop] = usePolling(
    async () => {
      if (sessionId) {
        try {
          const payload = await dispatch(getSession({ sessionId })).unwrap();
          if (payload) {
            setData({ ...payload });
          }
        } catch (error: any) {
          if (error?.name === 'NOT_FOUND') {
            // wait
          }
        }
      }
    },
    1500,
    [sessionId]
  );

  useEffect(() => {
    if (data?.status === 'completed') {
      stop();
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <main className="d-flex min-vh-100 my-5 text-center justify-content-center">
        <Container>
          {!data && <Spinner animation="grow" />}
          {data && (
            <>
              {data.data && (
                <Card className="text-start mb-3">
                  <Card.Header>Data</Card.Header>
                  <Card.Body>
                    <Table className="shadow-none">
                      <thead>
                        <tr className="d-none">
                          <th style={{ width: 'auto' }}></th>
                          <th style={{ width: '100%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(data.data).map((k, i) => {
                          return (
                            <tr key={`${k}-${i}`}>
                              <td>
                                <code>{k}</code>
                              </td>
                              <td style={{ wordBreak: 'break-all' }}>
                                <code>{data.data[k]}</code>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
              {data.status !== 'pending' && (
                <Card className="text-start">
                  <Card.Header>Verification result</Card.Header>
                  <Card.Body>
                    {data.status === 'verifying' && <Spinner animation="grow" />}
                    {data.status === 'completed' && !data.verificationResult && (
                      <Alert variant="danger">Verification failed!</Alert>
                    )}
                    {data.status === 'completed' && data.verificationResult && (
                      <Table className="shadow-none">
                        <thead>
                          <tr className="d-none">
                            <th style={{ width: 'auto' }}></th>
                            <th style={{ width: '100%' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <code>Owner address</code>
                            </td>
                            <td>
                              <code>{data.verificationResult.ownerEtheriumAddress}</code>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <code>Owner matched?</code>
                            </td>
                            <td>
                              {data.verificationResult.ownerMatched ? (
                                <CheckLg className="text-success fw-bold" />
                              ) : (
                                <XLg className="text-danger fw-bold" />
                              )}
                            </td>
                          </tr>
                          {Object.keys(data.verificationResult.attributes).map((k, i) => {
                            return (
                              <tr key={`${k}-${i}`}>
                                <td>
                                  <code>{k}</code>
                                </td>
                                <td style={{ wordBreak: 'break-all' }}>
                                  <ul className="list-unstyled">
                                    <li>
                                      <code className="me-3">Verification level</code>
                                      <code>
                                        {
                                          VerificationLevel[
                                            data.verificationResult.attributes[k].verificationLevel
                                          ]
                                        }
                                      </code>
                                    </li>
                                    <li>
                                      <code className="me-3">Attribute hash matched?</code>
                                      {data.verificationResult.attributes[k]
                                        .attributeHashMatched ? (
                                        <CheckLg className="text-success fw-bold" />
                                      ) : (
                                        <XLg className="text-danger fw-bold" />
                                      )}
                                    </li>
                                    <li>
                                      <code className="me-3">Proof off-chain matched?</code>
                                      {data.verificationResult.attributes[k]
                                        .merkleOffchainMatched ? (
                                        <CheckLg className="text-success fw-bold" />
                                      ) : (
                                        <XLg className="text-danger fw-bold" />
                                      )}
                                    </li>
                                    <li>
                                      <code className="me-3">Proof on-chain matched?</code>
                                      {data.verificationResult.attributes[k]
                                        .merkleOnchainMatched ? (
                                        <CheckLg className="text-success fw-bold" />
                                      ) : (
                                        <XLg className="text-danger fw-bold" />
                                      )}
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Container>
      </main>
    </>
  );
};

export default Result;

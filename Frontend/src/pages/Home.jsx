import React, { useEffect, useState } from 'react';
import SideBar from '../components/SideBar';
import Cookies from 'js-cookie';
import Notes from '../components/Notes';
import Navbar from '../components/Navbar';
import { delet, get, post, put } from '../services/ApiEndPoint';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import EidtModal from '../components/EidtModal';
import DeleteModal from '../components/DeleteModal';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";

export default function Home() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [updatetitle, setUpdatetitle] = useState('');
  const [modalId, setModalId] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [refersh, setRefersh] = useState(false);
  const [closeModal, setCloseModal] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleNoteSubmit = async () => {
    try {
      const request = await post('/notes/create', { title });
      const response = request.data;
      if (response.success) {
        toast.success(response.message);
        setRefersh(!refersh);
        setCloseModal(true);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
      console.log(error);
    }
  };

  const handeleUpdate = async () => {
    try {
      const request = await put(`/notes/update/${modalId}`, { title: updatetitle });
      const response = request.data;
      if (response.success) {
        toast.success(response.message);
        setRefersh(!refersh);
        setCloseModal(true);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
      console.log(error);
    }
  };

  const handelNotesDelete = async () => {
    try {
      const request = await delet(`/notes/delete/${modalId}`);
      const response = request.data;
      if (response.success) {
        toast.success(response.message);
        setRefersh(!refersh);
        setCloseModal(true);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
      console.log(error);
    }
  };

  useEffect(() => {
    const GetNotes = async () => {
      try {
        const request = await get('/notes/getnotes');
        const response = request.data;
        setNotes(response.Notes);
      } catch (error) {
        console.log(error);
      }
    };
    GetNotes();
  }, [refersh]);

  const downloadNoteAsPDF = (note) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("Note", 10, 10);
    doc.setFont("helvetica", "normal");
    doc.text(`Title: ${note.title}`, 10, 20);
    doc.text(`Date: ${formatDate(note.updatedAt)}`, 10, 30);
    doc.save(`${note.title.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <>
      <Modal
        Modaltitle={"Write Notes"}
        value={title}
        handleChange={(e) => setTitle(e.target.value)}
        handleNoteSubmit={handleNoteSubmit}
        HandleClose={closeModal}
      />
      <EidtModal
        Modaltitle={'Updated Notes'}
        handleChange={(e) => setUpdatetitle(e.target.value)}
        handleNoteSubmit={handeleUpdate}
        value={updatetitle}
      />
      <DeleteModal handelNotesDelete={handelNotesDelete} />

      <div className='row '>
        <div className='col-lg-2 col-md-2 shadow d-flex min-vh-100 '>
          <SideBar />
        </div>
        <div className='col-lg-10 col-md-10 '>
        
          <Navbar />
          {notes.length > 0 && (
            <div className='mt-3 mx-5'>
              <h1 className='fs-2 fw-bold'>NOTES</h1>
            </div>
          )}
          {notes.length === 0 && (
            <div className='mt-5 justify-content-center d-flex align-items-center'>
              <h1 className='fs-1 fw-bold'>No Notes Found</h1>
            </div>
          )}
          <div className='mt-4 mx-5 row'>
            {notes.map((elem, index) => (
              <div className='col-lg-4 col-md-4 mb-5' key={index}>
                <Notes
                  title={elem.title}
                  date={formatDate(elem.updatedAt)}
                  handleUpdate={() => setModalId(elem._id)}
                  handleDelete={() => setModalId(elem._id)}
                  handleDownload={() => downloadNoteAsPDF(elem)}
                />
               <button className='btn btn-sm btn-primary mt-2' onClick={() => downloadNoteAsPDF(elem)}>
                  Download PDF
                </button>

              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

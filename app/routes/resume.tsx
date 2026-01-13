import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resumind | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageURL, setImageURL] = useState("");
  const [resumeURL, setResumeURL] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);

      if (!resume) return;

      const data = JSON.parse(resume);

      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });

      const resumeURL = URL.createObjectURL(pdfBlob);

      setResumeURL(resumeURL);

      const imageBlob = await fs.read(data.imagePath);

      if (!imageBlob) return;

      const imageURL = URL.createObjectURL(imageBlob);

      setImageURL(imageURL);

      setFeedback(data.feedback);
      console.log({ resumeURL, imageURL, feedback: data.feedback });
    };
    loadResume();
  }, [id]);

  return (
    <main className="pt-0!">
      <nav className="resume-nav">
        <Link className="back-button" to="/">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Home
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col reverse">
        <section className=" feedback-section bg-[url('/images/bg-small.svg')] bg-cover sticky h-[100vh] top-0 items-center justify-center ">
          {imageURL && resumeURL && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fi">
              <a href={resumeURL} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageURL}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>
        <section className="feedback-section">
          <h2 className=" text-4x font-bold">Resume Review</h2>

          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary />
              <ATS />
              <Details />
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" alt="" className="w-full " />
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;

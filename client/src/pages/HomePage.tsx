import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="p-8 text-center">
      <Link to="/signup" className="font-semibold text-indigo-600 hover:underline">
        회원가입
      </Link>
    </div>
  );
}

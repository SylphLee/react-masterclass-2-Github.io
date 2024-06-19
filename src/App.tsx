import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { toDoState } from "./atoms";
import Board from "./Components/Board";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface IForm {
  category: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Boards = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  gap: 10px;
`;

const Form = styled.form`
  
`;

function App() {
  const [toDos, setToDos] = useRecoilState(toDoState);
  const { register, setValue, handleSubmit } = useForm<IForm>();
  useEffect(() => {
    if (localStorage.getItem("allBoards")) {
      setToDos(() => {
        return JSON.parse(localStorage.getItem("allBoards") || "");
      });
    }
  }, []);
  const onDragEnd = (info: DropResult) => {
    const { destination, draggableId, source } = info;
    if (!destination) return;
    if (destination?.droppableId === source.droppableId) {
      setToDos((allBoards) => {
        const boardCopy = [...allBoards[source.droppableId]];
        const taskObj = boardCopy[source.index];
        boardCopy.splice(source.index, 1);
        boardCopy.splice(destination?.index, 0, taskObj);
        const newAllBoards = {
          ...allBoards,
          [source.droppableId]: boardCopy
        };
        localStorage.setItem("allBoards", JSON.stringify(newAllBoards));
        return newAllBoards;
      });
    }
    if(destination.droppableId !== source.droppableId) {
      setToDos((allBoards) => {
        const sourceBoard = [...allBoards[source.droppableId]];
        const taskObj = sourceBoard[source.index];
        const destinationBoard = [...allBoards[destination.droppableId]];
        sourceBoard.splice(source.index, 1);
        destinationBoard.splice(destination?.index, 0, taskObj);
        const newAllBoards = {
          ...allBoards,
          [source.droppableId]: sourceBoard,
          [destination.droppableId]: destinationBoard,
        };
        localStorage.setItem("allBoards", JSON.stringify(newAllBoards));
        return newAllBoards;
      });
    };
  };
  const onValid = ({ category }: IForm) => {
    setToDos((allBoards) => {
      const newBoards = { ...allBoards, [category]: [] };
      localStorage.setItem("allBoards", JSON.stringify(newBoards));
      return newBoards;
    });
    setValue("category", "");
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      
      <Wrapper>
      <form onSubmit={handleSubmit(onValid)}>
          <input
            {...register("category", { required: true })}
            type="text"
            placeholder="Add Category"
          />
        </form>
        <Boards>
          {Object.keys(toDos).map((boardId) => (
            <Board boardId={boardId} key={boardId} toDos={toDos[boardId]} />
          ))}
        </Boards>
      </Wrapper>
    </DragDropContext>
  );
}

export default App;
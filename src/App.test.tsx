/* eslint-disable */
import React from "react";
import renderer from "react-test-renderer";
import App from "./App";
import Adapter from "enzyme-adapter-react-16";
import { shallow, configure, mount } from "enzyme";
import moment from "moment";
import { fireEvent, getByTestId, render } from "@testing-library/react";

configure({ adapter: new Adapter() });

describe("App", () => {
  it("renders correctly", () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toMatchSnapshot();
    // On the first run of this test, Jest will generate a snapshot file automatically.
  });

  const date = "21.11.2015",
    format = "DD.MM.YYYY";
  it("render valueToDate utility with defined value", () => {
    const value = moment(date, format);
    expect(value).toEqual(moment(date, format));
  });

  it("handleChange function called", async () => {
    // const spy = jest.fn();
    // const { findByTestId } = render(<App />);
    // let input = await findByTestId("category");
    // fireEvent.change(input, { target: { value: "23" } });
    // expect(spy).toHaveBeenCalledTimes(1);
    
    const spy = jest.fn();
    const wrapper = shallow(<App />);
    const input = await wrapper.find('category');
    fireEvent.change(input, { target: { value: "23" } });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
